const remoteEntryPromise = import('./remoteEntry-oh3x7T-W.js');
    // __tla only serves as a hack for vite-plugin-top-level-await. 
    Promise.resolve(remoteEntryPromise)
      .then(remoteEntry => {
        return Promise.resolve(remoteEntry.__tla)
          .then(remoteEntry.init).catch(remoteEntry.init)
      });
