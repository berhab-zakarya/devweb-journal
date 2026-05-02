<?php

return [
    'default' => 'default',
    'documentations' => [
        'default' => [
            'api' => [
                'title' => 'Academic Journal API',
            ],

            'routes' => [
                /*
                 * Route for accessing api documentation interface
                 */
                'api' => 'api/documentation',
            ],
            'paths' => [
                /*
                 * Edit to include full URL in ui for assets
                 */
                'use_absolute_path' => env('L5_SWAGGER_USE_ABSOLUTE_PATH', true),

                /*
                 * File name of the generated json documentation file
                 */
                'docs_json' => 'api-docs.json',

                /*
                 * File name of the generated YAML documentation file
                 */
                'docs_yaml' => 'api-docs.yaml',

                /*
                 * Set this to `json` or `yaml` to determine which documentation file to use in UI
                 */
                'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),

                /*
                 * Absolute paths to directory containing the swagger annotations are stored.
                 */
                'annotations' => [
                    base_path('app'),
                ],

            ],
        ],
    ],
    'defaults' => [
        'routes' => [
            /*
             * Route for accessing parsed swagger annotations.
             */
            'docs' => 'docs',

            /*
             * Route for Oauth2 authentication callback.
             */
            'oauth2_callback' => 'api/oauth2-callback',

            /*
             * Middleware allows to prevent unexpected access to API documentation
             */
            'middleware' => [
                'api' => [],
                'asset' => [],
                'docs' => [],
                'oauth2_callback' => [],
            ],

            /*
             * Route Group options
             */
            'group_options' => [],
        ],

        'paths' => [
            /*
             * Absolute path to location where parsed swagger annotations will be stored
             */
            'docs' => storage_path('api-docs'),

            /*
             * Absolute path to directory where to export views
             */
            'views' => base_path('resources/views/vendor/l5-swagger'),

            /*
             * Edit to set the api's base path
             */
            'base' => env('L5_SWAGGER_BASE_PATH', null),

            /*
             * Absolute path to a directory containing the swagger assets (like swagger-ui)
             */
            'swagger_ui_assets_path' => env('L5_SWAGGER_UI_ASSETS_PATH', 'vendor/swagger-api/swagger-ui/dist/'),

            /*
             * Absolute path to a swagger.json file created by the extension library.
             */
            'excludes' => [],
        ],

        'scanOptions' => [
            /*
             * analyser: defaults to \OpenApi\StaticAnalyser
             * @see https://github.com/zircote/swagger-php/blob/master/src/StaticAnalyser.php
             */
            'analyser' => null,

            /*
             * analysis: defaults to a new \OpenApi\Analysis
             */
            'analysis' => null,

            /*
             * Custom query path processors classes
             * @link https://github.com/zircote/swagger-php/tree/master/Examples/schema-query-parameter-processor
             */
            'processors' => [],

            /*
             * pattern: an alternative file pattern to use, defaults to '*.php'
             */
            'pattern' => null,

            /*
             * Absolute path to a directory (or an array of directories) containing the swagger annotations
             * are stored.
             */
            'exclude' => [],

            /*
             * Allows to generate specs either for OpenAPI 3.0.0 or OpenAPI 3.1.0.
             * By default the spec will be in version 3.0.0
             */
            'open_api_spec_version' => env('L5_SWAGGER_OPEN_API_SPEC_VERSION', \L5Swagger\Generator::OPEN_API_DEFAULT_SPEC_VERSION),
        ],

        /*
         * API security definitions. Will be generated into the swagger documentation
         */
        'securityDefinitions' => [
            'securitySchemes' => [],
            'security' => [],
        ],

        /*
         * Set this to `true` in development mode so that docs would be regenerated on each request
         * Set this to `false` to disable swagger generation on production
         */
        'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', false),

        /*
         * Set this to `true` to generate a copy of documentation in yaml format
         */
        'generate_yaml_copy' => env('L5_SWAGGER_GENERATE_YAML_COPY', false),

        /*
         * Edit to trust the proxy's IP address - needed for AWS Load Balancer
         * string[]
         */
        'proxy' => false,

        /*
         * Configs plugin allows to fetch external configs instead of passing them to SwaggerUIBundle.
         * See more at: https://github.com/richardlee159/swagger-ui-config-plugin
         */
        'additional_config_url' => null,

        /*
         * Apply a sort to the operation list of each API. It can be 'alpha' (sort by paths alphanumerically),
         * 'method' (sort by HTTP method).
         * Default is the order returned by the server unchanged.
         */
        'operations_sort' => env('L5_SWAGGER_OPERATIONS_SORT', null),

        /*
         * Pass the validatorUrl parameter to SwaggerUi init on the JS side.
         * A null value here disables the validator functionality.
         * ' ' Disable validation
         */
        'validator_url' => null,

        /*
         * Uncomment this parameter to enable the use of custom swagger-ui assets.
         * If set to true, the package will look for assets in the resources/views/vendor/l5-swagger directory.
         */
        'use_absolute_path' => true,

        /*
         * UI configuration params
         * See more at: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
         */
        'ui' => [
            'display' => [
                /*
                 * Controls the default expansion setting for the operations and tags.
                 * It can be 'list' (expands only the tags), 'full' (expands the tags and operations) or 'none' (expands nothing).
                 */
                'doc_expansion' => env('L5_SWAGGER_UI_DOC_EXPANSION', 'none'),

                /**
                 * If set to true, enables filtering. The top bar will show an edit box that
                 * could be used to filter the tagged operations that are shown. Can be Boolean to
                 * enable or disable, or a string, in which case filtering will be enabled using
                 * that string as the filter expression. Filtering is case-sensitive matching the
                 * filter expression anywhere inside the tag.
                 */
                'filter' => env('L5_SWAGGER_UI_FILTERS', true),

                /*
                 * If set, limits the number of tagged operations displayed to at most this many.
                 * The default is to show all operations.
                 */
                'max_displayed_tags' => null,
            ],

            'authorization' => [
                /*
                 * If set to true, it persists authorization data, and it would not be lost on browser close/refresh
                 */
                'persist_authorization' => env('L5_SWAGGER_UI_PERSIST_AUTHORIZATION', false),

                'oauth2' => [
                    /*
                     * If set to true, adds PKCE to AuthCode flows
                     */
                    'use_pkce_with_authorization_code_grant' => false,
                ],
            ],
        ],
        /*
         * Constants which can be used in annotations
         */
        'constants' => [
            'L5_SWAGGER_CONST_HOST' => env('L5_SWAGGER_CONST_HOST', 'http://my-default-host.com'),
        ],
    ],
];
