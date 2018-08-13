import { uiModules } from 'ui/modules';
const app = uiModules.get('apps/searchguard/configuration', []);

/**
 * This directive adds the ability to select an item in
 * a dropdown list (ui-select) on blur, i.e. without
 * explicitly clicking the selected item
 *
 * Credit: https://stackoverflow.com/a/31947492/847856
 */
app.directive('selectOnBlur', function() {
    return {
        require: 'uiSelect',
        link: function(scope, element, attributes, uiSelectController) {
            element.on('blur', 'input.ui-select-search', function(event) {
                if(uiSelectController.open && (uiSelectController.activeIndex >= 0)){
                    uiSelectController.select(uiSelectController.items[uiSelectController.activeIndex]);
                }
                event.target.value = '';
            });
        }
    };
})