const formikToActionGroup = formik => {
  const { permissions, actiongroups } = formik;
  return {
    permissions: permissions.map(({ label }) => label),
    actiongroups: actiongroups.map(({ label }) => label)
  };
};
export default formikToActionGroup;
