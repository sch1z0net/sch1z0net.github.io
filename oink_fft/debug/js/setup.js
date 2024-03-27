///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
import registerPlugin from './interface.js'
import PLUGIN_INDUTNY from './fft_libs/indutny/plugin.js'
import PLUGIN_DSP     from './fft_libs/dsp/plugin.js'
import PLUGIN_OOURA   from './fft_libs/ooura/plugin.js'
import PLUGIN_KISS    from './fft_libs/kiss/plugin.js'
import PLUGIN_OINK    from './fft_libs/oink/plugin.js'
import PLUGIN_OINK_js from './fft_libs/oink_js/plugin.js'

async function setup(FFT_BANK){
    await registerPlugin(PLUGIN_INDUTNY, FFT_BANK);
    await registerPlugin(PLUGIN_DSP, FFT_BANK);
    await registerPlugin(PLUGIN_OOURA, FFT_BANK);
    await registerPlugin(PLUGIN_KISS, FFT_BANK);
    await registerPlugin(PLUGIN_OINK, FFT_BANK);
    await registerPlugin(PLUGIN_OINK_js, FFT_BANK);
};

export default setup;
