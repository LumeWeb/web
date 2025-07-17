import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-YjtT0XC7.js';

function index() {
  return {
    async destroy(_framework) {
      console.log("Plugin Dashboard destroyed");
    },
    id: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "dashboard"),
    async initialize(_framework) {
      console.log("Plugin Dashboard initialized");
    }
  };
}

export { index as default };
