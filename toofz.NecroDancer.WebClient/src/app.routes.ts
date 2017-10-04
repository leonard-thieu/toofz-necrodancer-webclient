import * as _ from 'lodash';
import * as util from './util';

import * as angular from 'angular';

import {
    IState,
    IStateParamsService
} from 'angular-ui-router';
import { ToofzRestApi } from './modules/toofz-rest-api/toofz-rest-api';
import { ToofzSiteApi } from './modules/toofz-site-api/toofz-site-api';

angular
    .module('necrodancer.app')
    .config((apiBaseUrl: string,
             $locationProvider: angular.ILocationProvider,
             $stateProvider: angular.ui.IStateProvider,
             $urlMatcherFactoryProvider: angular.ui.IUrlMatcherFactory) => {
        'ngInject';
        $urlMatcherFactoryProvider.strictMode(false);
        $urlMatcherFactoryProvider.defaultSquashPolicy(true);
        $urlMatcherFactoryProvider.caseInsensitive(true);

        const rootState: IState = {
            abstract: true,
            name: 'root',
            url: '',
            templateUrl: '../root.html?v=2',
            resolve: {
                areas: (toofzSiteApi: ToofzSiteApi) => {
                    'ngInject';
                    return toofzSiteApi.getAreas();
                },
                version: (version: string) => {
                    'ngInject';
                    return version;
                }
            }
        };
        $stateProvider.state(rootState);

        const landingState: IState = {
            name: 'root.landing',
            url: '',
            templateUrl: '../landing.html'
        };
        $stateProvider.state(landingState);

        const itemsState: IState = {
            name: 'root.items',
            url: '/items/{category}/{subcategory}?{page:int}',
            params: {
                category: null,
                subcategory: null,
                page: 1
            },
            template: '<nd-items data="::$resolve.items"></nd-items>',
            resolve: {
                items: ($stateParams: IStateParamsService,
                        toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { category, subcategory, page } = $stateParams;
                    const params = {
                        offset: util.pageToOffset(page, 10)
                    };

                    if (!category) {
                        return toofzRestApi.getItems(params);
                    }
                    if (!subcategory) {
                        return toofzRestApi.getItemsByCategory(category, params);
                    }
                    return toofzRestApi.getItemsBySubcategory(category, subcategory, params);
                }
            }
        };
        $stateProvider.state(itemsState);

        const enemiesState: IState = {
            name: 'root.enemies',
            url: '/enemies/{attribute}?{page:int}',
            params: {
                attribute: null,
                page: 1
            },
            template: '<nd-enemies data="::$resolve.enemies"></nd-enemies>',
            resolve: {
                enemies: ($stateParams: IStateParamsService,
                          toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    let { attribute, page } = $stateParams;

                    if (attribute) { attribute = attribute.toLowerCase(); }

                    switch (attribute) {
                        case 'phasing':
                            attribute = 'ignore-walls';
                            break;
                    }

                    const params = {
                        offset: util.pageToOffset(page, 10)
                    };

                    if (!attribute) {
                        return toofzRestApi.getEnemies(params);
                    }
                    return toofzRestApi.getEnemiesByAttribute(attribute, params);
                }
            }
        };
        $stateProvider.state(enemiesState);

        const leaderboardsState: IState = {
            name: 'root.leaderboards',
            url: '/leaderboards',
            template: '<nd-leaderboards categories="::$resolve.categories" leaderboards="::$resolve.leaderboards"></nd-leaderboards>',
            params: {
                categories: null
            },
            resolve: {
                categories: (toofzSiteApi: ToofzSiteApi,
                             $stateParams: angular.ui.IStateParamsService) => {
                    'ngInject';
                    const { categories } = $stateParams;

                    if (categories) {
                        return categories;
                    }

                    return toofzSiteApi.getLeaderboardCategories();
                },
                leaderboards: (categories: toofzSite.Leaderboard.Categories,
                               toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const params: any = {};

                    _.each(categories, (category, name) => {
                        params[name!] = _.reduce(category, (result, value, key) => {
                            if (value.value) {
                                result.push(key);
                            }

                            return result;
                        }, [] as string[]);
                    });

                    if (params.products.length &&
                        params.modes.length &&
                        params.runs.length &&
                        params.characters.length) {
                        return toofzRestApi.getLeaderboards(params).then(data => data.leaderboards);
                    } else {
                        return Promise.resolve([]);
                    }
                }
            }
        };
        $stateProvider.state(leaderboardsState);

        const products = ['amplified', 'classic'].join('|');
        const characters = ['all', 'all-characters', 'all-characters-amplified', 'aria', 'bard', 'bolt', 'cadence', 'coda',
            'diamond', 'dorian', 'dove', 'eli', 'mary', 'melody', 'monk', 'nocturna', 'story', 'story-mode', 'tempo'].join('|');
        const runs = ['score', 'speed', 'seededscore', 'seeded-score', 'seededspeed', 'seeded-speed', 'deathless'].join('|');
        const modes = ['standard', 'no-return', 'hard-mode', 'hard', 'phasing', 'randomizer', 'mystery'].join('|');

        const leaderboardState: IState = {
            name: 'root.leaderboard',
            url: `/leaderboards/{product:${products}}/{character:${characters}}/{run:${runs}}/{mode:${modes}}?{page:int}&{id}`,
            template: '<nd-leaderboard data="::$resolve.entries" player-entry="::$resolve.player"></nd-leaderboard>',
            params: {
                product: 'classic',
                mode: 'standard'
            },
            resolve: {
                leaderboard: ($stateParams: IStateParamsService,
                              toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    let { product, mode, run, character } = $stateParams;

                    product = product.toLowerCase();
                    mode = mode.toLowerCase();
                    run = run.toLowerCase();
                    character = character.toLowerCase();

                    switch (mode) {
                        case 'hard-mode':
                            mode = 'hard';
                            break;
                    }

                    switch (run) {
                        case 'seededscore':
                            run = 'seeded-score';
                            break;
                        case 'seededspeed':
                            run = 'seeded-speed';
                            break;
                    }

                    switch (character) {
                        case 'all':
                            character = 'all-characters';
                            break;
                        case 'story':
                            character = 'story-mode';
                            break;
                    }

                    return toofzRestApi.getLeaderboards({
                        products: [product],
                        modes: [mode],
                        runs: [run],
                        characters: [character],
                    }).then(leaderboardsEnvelope => {
                        const leaderboard = leaderboardsEnvelope.leaderboards[0];
                        if (!leaderboard) {
                            // TODO: Can this redirect instead?
                            throw new Error(`Leaderboard could not be found for parameters: ${JSON.stringify($stateParams)}.`);
                        }

                        return leaderboard;
                    });
                },
                // This resolve is optional. If an entry can't be found, just display leaderboard entries without highlighting a player.
                player: ($stateParams: IStateParamsService,
                         leaderboard: toofz.Leaderboard,
                         toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { id } = $stateParams;

                    if (!id) {
                        return undefined;
                    }

                    return toofzRestApi.getPlayerLeaderboardEntry(id, leaderboard.id)
                        .catch(() => { });
                },
                entries: ($stateParams: IStateParamsService,
                          leaderboard: toofz.Leaderboard,
                          player: toofz.Entry,
                          toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { page } = $stateParams;

                    let offset: number;
                    if (!page && player) {
                        offset = util.roundDownToMultiple(player.rank - 1, 20);
                    } else {
                        offset = util.pageToOffset(page, 20)!;
                    }
                    const params = {
                        offset: offset !== 0 ? offset : undefined
                    };

                    return toofzRestApi.getLeaderboardEntries(leaderboard.id, params);
                }
            }
        };
        $stateProvider.state(leaderboardState);

        const dailyLeaderboardState: IState = {
            name: 'root.daily-leaderboard',
            url: `/leaderboards/{product:${products}}/daily?{page:int}&{id}`,
            template: '<nd-leaderboard data="::$resolve.entries" player-entry="::$resolve.player"></nd-leaderboard>',
            params: {
                product: 'classic'
            },
            resolve: {
                leaderboard: ($stateParams: IStateParamsService,
                              toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { product } = $stateParams;

                    return toofzRestApi.getDailyLeaderboards({
                        products: [product]
                    }).then(data => data.leaderboards[0]);
                },
                // This resolve is optional. If an entry can't be found, just display leaderboard entries without highlighting a player.
                player: ($stateParams: IStateParamsService,
                         leaderboard: toofz.DailyLeaderboard,
                         toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { id } = $stateParams;

                    if (!id) {
                        return undefined;
                    }

                    return toofzRestApi.getPlayerLeaderboardEntry(id, leaderboard.id)
                        .catch(() => { });
                },
                entries: ($stateParams: IStateParamsService,
                          leaderboard: toofz.DailyLeaderboard,
                          player: toofz.Entry,
                          toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { page } = $stateParams;

                    let offset: number;
                    if (!page && player) {
                        offset = util.roundDownToMultiple(player.rank - 1, 20);
                    } else {
                        offset = util.pageToOffset(page, 20)!;
                    }
                    const params = {
                        offset: offset !== 0 ? offset : undefined
                    };

                    return toofzRestApi.getDailyLeaderboardEntries(leaderboard.id, params);
                }
            }
        };
        $stateProvider.state(dailyLeaderboardState);

        const playerState: IState = {
            name: 'root.player',
            url: '/p/{id}/{slug}',
            params: {
                slug: null
            },
            template: '<nd-player-profile data="::$resolve.player" categories="::$resolve.categories"></nd-player-profile>',
            resolve: {
                player: ($stateParams: IStateParamsService,
                         toofzRestApi: ToofzRestApi) => {
                    'ngInject';
                    const { id } = $stateParams;

                    return toofzRestApi.getPlayerEntries(id);
                },
                categories: (toofzSiteApi: ToofzSiteApi) => {
                    'ngInject';
                    return toofzSiteApi.getLeaderboardCategories();
                }
            }
        };
        $stateProvider.state(playerState);

        const otherwiseState: IState = {
            name: 'root.otherwise',
            url: '*path',
            templateUrl: '../404.html'
        };
        $stateProvider.state(otherwiseState);

        $locationProvider.html5Mode(true);
    });
