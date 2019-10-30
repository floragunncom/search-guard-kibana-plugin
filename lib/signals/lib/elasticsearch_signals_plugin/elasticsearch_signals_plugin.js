export const elasticsearchSignalsPlugin = (Client, config, components) => {
  const ca = components.clientAction.factory;

  // eslint-disable-next-line no-param-reassign
  Client.prototype.sgSignals = components.clientAction.namespaceFactory();
  const sgSignals = Client.prototype.sgSignals.prototype;

  sgSignals.getWatch = ca({
    params: {},
    url: {
      fmt: '/_signals/watch/<%=sgtenant%>/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true
        },
        sgtenant: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'GET'
  });

  sgSignals.getWatches = ca({
    params: {},
    url: {
      fmt: '/_signals/watch/<%=sgtenant%>/_search?scroll=<%=scroll%>',
      req: {
        scroll: {
          type: 'string',
          required: false
        },
        sgtenant: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'GET'
  });

  sgSignals.saveWatch = ca({
    params: {
      masterTimeout: {
        name: 'master_timeout',
        type: 'duration'
      }
    },
    url: {
      fmt: '/_signals/watch/<%=sgtenant%>/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true
        },
        sgtenant: {
          type: 'string',
          required: true
        }
      }
    },
    needBody: true,
    method: 'PUT'
  });

  sgSignals.deleteWatch = ca({
    params: {
      masterTimeout: {
        name: 'master_timeout',
        type: 'duration'
      },
      force: {
        type: 'boolean'
      }
    },
    url: {
      fmt: '/_signals/watch/<%=sgtenant%>/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true
        },
        sgtenant: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'DELETE'
  });

  sgSignals.executeWatch = ca({
    params: {
      masterTimeout: {
        name: 'master_timeout',
        type: 'duration'
      }
    },
    url: {
      fmt: '/_signals/watch/<%=sgtenant%>/_execute',
      req: {
        sgtenant: {
          type: 'string',
          required: true
        }
      }
    },
    needBody: true,
    method: 'POST'
  });

  sgSignals.getDestination = ca({
    params: {},
    url: {
      fmt: '/_signals/destination/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'GET'
  });

  sgSignals.getDestinations = ca({
    params: {},
    url: {
      fmt: '/_signals/destination/_search?scroll=<%=scroll%>',
      req: {
        scroll: {
          type: 'string',
          required: false
        }
      }
    },
    method: 'GET'
  });

  sgSignals.saveDestination = ca({
    params: {
      masterTimeout: {
        name: 'master_timeout',
        type: 'duration'
      }
    },
    url: {
      fmt: '/_signals/destination/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true
        }
      }
    },
    needBody: true,
    method: 'PUT'
  });

  sgSignals.deleteDestination = ca({
    params: {
      masterTimeout: {
        name: 'master_timeout',
        type: 'duration'
      },
      force: {
        type: 'boolean'
      }
    },
    url: {
      fmt: '/_signals/destination/<%=id%>',
      req: {
        id: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'DELETE'
  });
};
