#include "kiss_fftr.h"

#include <emscripten/bind.h>
#include <emscripten/val.h>

enum class FftDirection {
  Direct,
  Inverse
};

struct KissFftBase {
  KissFftBase(size_t size, FftDirection direction) {
    state = kiss_fftr_alloc(size, direction == FftDirection::Direct ? 0 : 1, nullptr, nullptr);
  }
  ~KissFftBase() {
    kiss_fft_free(state);
  }

  kiss_fftr_state *state;
};

emscripten::val toJSFloat64Array(const std::vector<double> &v) {
  emscripten::val view{ emscripten::typed_memory_view(v.size(), v.data()) };  // make a view of local object

  auto result = emscripten::val::global("Float64Array").new_(v.size());  // make a JS typed array
  result.call<void>("set", view);  // set typed array values "on the JS side" using the memory view

  return result;
}

//...
struct KissFftReal : KissFftBase {
  KissFftReal(size_t size) : KissFftBase{ size, FftDirection::Direct } {
    input.resize(size);       // initialize buffers with sizes on construction
    output.resize(size + 2);  // complex output needs +1 bin (+2 elements) for Nyquist frequency
  }

  auto transform() const {
    kiss_fftr(state, input.data(), reinterpret_cast<kiss_fft_cpx*>(output.data()));

    return emscripten::val{ emscripten::typed_memory_view(output.size(), output.data()) };  // return view of output data buffer
  }

  auto getInputTimeDataBuffer() {
    return emscripten::val{ emscripten::typed_memory_view(input.size(), input.data()) };  // return view of input data buffer
  }

private:
  std::vector<double> input;
  mutable std::vector<double> output;
};

struct KissFftRealInverse : KissFftBase {
  KissFftRealInverse(size_t size) : KissFftBase{ size, FftDirection::Inverse } {
    input.resize(size + 2);  // complex input should contain +1 bin (+2 elements) for Nyquist frequency
    output.resize(size);
  }

  auto transform() const {
    kiss_fftri(state, reinterpret_cast<const kiss_fft_cpx*>(input.data()), output.data());

    return emscripten::val{ emscripten::typed_memory_view(output.size(), output.data()) };
  }

  auto getInputFrequencyDataBuffer() {
    return emscripten::val{ emscripten::typed_memory_view(input.size(), input.data()) };
  }

private:
  std::vector<double> input;
  mutable std::vector<double> output;
};

EMSCRIPTEN_BINDINGS(KissFft) {  // expose classes each with ctor and two methods
  emscripten::class_<KissFftReal>("KissFftReal")
    .constructor<size_t>()
    .function("getInputTimeDataBuffer", &KissFftReal::getInputTimeDataBuffer)
    .function("transform", &KissFftReal::transform)
    ;

  emscripten::class_<KissFftRealInverse>("KissFftRealInverse")
    .constructor<size_t>()
    .function("getInputFrequencyDataBuffer", &KissFftRealInverse::getInputFrequencyDataBuffer)
    .function("transform", &KissFftRealInverse::transform)
    ;
}
