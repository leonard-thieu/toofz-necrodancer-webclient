import * as angular from 'angular';

declare global {
    const apiBaseUrl: string;
    const fingerprint: {
        get(url: string): string;
    };
}

angular
    .module('necrodancer.app')
    .constant('apiBaseUrl', apiBaseUrl)
    .config((cfpLoadingBarProvider: angular.loadingBar.ILoadingBarProvider) => {
        'ngInject';
        cfpLoadingBarProvider.latencyThreshold = 0;
    })
    .run(($rootScope: angular.IRootScopeService,
          $log: angular.ILogService) => {
        'ngInject';
        $rootScope.$on('$stateChangeError', (event, fromState, fromParams, toState, toParams, error) => {
            $log.error({
                event,
                fromState,
                fromParams,
                toState,
                toParams,
                error,
            });
        });
    });