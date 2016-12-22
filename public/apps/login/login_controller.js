import chrome from 'ui/chrome';

export default function LoginController($scope, $http, $window) {

    const ROOT = chrome.getBasePath();
    const APP_ROOT = `${ROOT}/searchguard`;
    const API_ROOT = `${APP_ROOT}/api/v1/auth`;

    this.errorMessage = false;

    this.submit = () => {
        $http.post(`${API_ROOT}/login`, this.credentials)
            .then(
            (response) => {
                $window.location.href = `${ROOT}/`;
            },
            (error) => {
                if (error.status && error.status === 401) {
                    this.errorMessage = 'Invalid username or password, please try again';
                } else {
                    this.errorMessage = 'An error occurred while checking your credentials, make sure your have a running Elasticsearch cluster secured by Search Guard running.';
                }
            }
        );
    };

};
