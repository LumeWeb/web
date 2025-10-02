const exposesMap = {
    
        ".": async () => {
          const importModule = await import('./index-Bbat9OFo.js');
          const exportModule = {};
          Object.assign(exportModule, importModule);
          Object.defineProperty(exportModule, "__esModule", {
            value: true,
            enumerable: false
          });
          return exportModule
        }
      ,
        "./file-manager": async () => {
          const importModule = await import('./file-manager-BC5RTPlu.js');
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
