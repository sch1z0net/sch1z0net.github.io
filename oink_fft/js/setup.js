///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
import registerPlugin from './interface.js'
import PLUGIN_INDUTNY from './indutny/plugin.js'
import PLUGIN_DSP     from './dsp/plugin.js'
import PLUGIN_OOURA   from './ooura/plugin.js'
import PLUGIN_KISS    from './kiss/plugin.js'
import PLUGIN_OINK    from './oink/plugin.js'

async function setup(FFT_BANK){
    await registerPlugin(PLUGIN_INDUTNY, FFT_BANK);
    await registerPlugin(PLUGIN_DSP, FFT_BANK);
    await registerPlugin(PLUGIN_OOURA, FFT_BANK);
    await registerPlugin(PLUGIN_KISS, FFT_BANK);
    await registerPlugin(PLUGIN_OINK, FFT_BANK);
};

export default setup;
