const exposesMap = {
    
        ".": async () => {
          const importModule = await import('./index-C3u8g3WK.js');
          const exportModule = {};
          Object.assign(exportModule, importModule);
          Object.defineProperty(exportModule, "__esModule", {
            value: true,
            enumerable: false
          });
          return exportModule
        }
      ,
        "./NotFound": async () => {
          const importModule = await import('./NotFound-kN9SXyxR.js');
          const exportModule = {};
          Object.assign(exportModule, importModule);
          Object.defineProperty(exportModule, "__esModule", {
            value: true,
            enumerable: false
          });
          return exportModule
        }
      
  };

export { exposesMap as default };
