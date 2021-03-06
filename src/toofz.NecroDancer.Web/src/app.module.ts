import './app.scss';

import 'imports-loader?jQuery=jquery!bootstrap';
import * as angular from 'angular';
import uirouter from '@uirouter/angularjs';
import * as angularLoadingBar from 'angular-loading-bar';
import enemies from './enemies/enemies.module';
import items from './items/items.module';
import leaderboard from './leaderboard/leaderboard.module';
import leaderboards from './leaderboards/leaderboards.module';
import navbar from './navbar/navbar.module';
import profile from './profile/profile.module';
import search from './search/search.module';
import toofzRestApi from './toofz-rest-api/toofz-rest-api.module';

// ngdoc support
/**
 * @typedef {*} expression
 */

// ngStrictDi
/**
 * @ngdoc directive
 * @name ngStrictDi
 * @restrict A
 *
 * @param {boolean} ngStrictDi
 */

// ngSwitchWhenSeparator
/**
 * @ngdoc directive
 * @name ngSwitchWhenSeparator
 * @restrict A
 *
 * @param {string} ngSwitchWhenSeparator
 */

angular
    .module('necrodancer.app', [
        uirouter,
        angularLoadingBar,
        enemies,
        items,
        leaderboard,
        leaderboards,
        navbar,
        profile,
        search,
        toofzRestApi,
    ])
    .config(($httpProvider: angular.IHttpProvider) => {
        'ngInject';
        const loggingInterceptor = ($log: angular.ILogService) => {
            'ngInject';
            return {
                // TODO: Should display error to user
                // TODO: Consider retry logic
                requestError: (rejection: any) => {
                    $log.error(rejection);
                },
            };
        };
        $httpProvider.interceptors.push(loggingInterceptor as any);
    });

import './app.routes';
import './app.config';
