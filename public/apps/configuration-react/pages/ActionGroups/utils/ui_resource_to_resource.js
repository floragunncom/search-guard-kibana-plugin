const uiResourceToResource = resource => {
  const { _permissions, _actiongroups, type } = resource;
  return {
    type,
    allowed_actions: [..._permissions, ..._actiongroups]
  };
};

export default uiResourceToResource;
