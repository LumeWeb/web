const remoteEntryPromise = import('./remoteEntry-BdIFUs2x.js');
    // __tla only serves as a hack for vite-plugin-top-level-await.
    Promise.resolve(remoteEntryPromise)
      .then(remoteEntry => {
        return Promise.resolve(remoteEntry.__tla)
          .then(remoteEntry.init).catch(remoteEntry.init)
      });
