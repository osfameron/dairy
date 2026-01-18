// npx mocha -u qunit

import assert from "assert";
import type { PageContainer } from "../index.ts";
import  { parsePageContainer } from "../index.ts";
import fs from "fs";

suite("Parser tests");

test("basic", function () {
  const data = JSON.parse(fs.readFileSync("src/test/petstore_oas3_requestBody_example.json", "utf-8"));

  const pageContainer: PageContainer = parsePageContainer(data);
  
  const expected: PageContainer = 
    {
      page: {
        kind: 'overview',
        id: 'unknown',
        title: 'Swagger Petstore',
        slug: 'swagger-petstore'
      },
      blocks: [
        {
          type: "section",
          title: "Swagger Petstore (1.0.0)",
          level: 1,
          children: [
            {
              type: 'overview.meta',
              email: 'apiteam@swagger.io',
              license: {
                name: 'Apache 2.0',
                url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
              },
              termsOfService: 'http://swagger.io/terms/'
            },
            {
              type: 'overview.description',
              body: 'This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.'
            },
            {
              type: 'overview.servers',
              servers: [
                {
                  url: 'http://petstore.swagger.io/v2'
                }
              ]
            },
            {
              type: 'overview.description',
              body: 'Find out more about Swagger ([link](http://swagger.io))'
            },
            {
              type: "section",
              title: "pet",
              level: 2,
              children: [
            {
              type: 'overview.description',
              body: 'Everything about your Pets'
            },
            {
              type: 'overview.description',
              body: 'Find out more ([link](http://swagger.io))'
            },
            {
              type: "section",
              title: "Finds Pets by status",
              level: 3,
              children: [
                {
                  type: 'overview.description',
                  body: 'Multiple status values can be provided with comma separated strings'
                },
                {
                  type: 'op.parameters',
                  groups: [
                    {
                      in: 'query',
                      title: 'Query',
                      items: [
                        {
                          kind: 'param',
                          name: 'status',
                          in: 'query',
                          required: true,
                          description: 'Status values that need to be considered for filter',
                          type: {
                            type: 'array',
                            items: {
                              type: 'string',
                              enum: ['available', 'pending', 'sold'],
                              default: 'available'
                            }
                          },
                          examples: [
                            {
                              summary: 'Available',
                              description: 'Showing status of `available`, using `value` property',
                              value: 'available'
                            },
                            {
                              summary: 'Sold',
                              description: 'Showing status of `sold`, using `externalValue` property',
                              externalValue: 'http://example.com/examples/dog.json'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  type: 'op.example',
                  mediaType: 'application/json',
                  examples: [
                    {
                      summary: 'Example response showing no pets are matched',
                      description: 'An example response, using `value` property',
                      value: []
                    },
                    {
                      summary: 'Example response showing a regular response',
                      description: 'Two pets are returned in this example.',
                      value: [{
                        id: 1,
                        category: {
                          id: 1,
                          name: 'cat'
                        },
                        name: 'fluffy',
                        photoUrls: [
                          'http://example.com/path/to/cat/1.jpg',
                          'http://example.com/path/to/cat/2.jpg'
                        ],
                        tags: [{
                          id: 1,
                          name: 'cat'
                        }],
                        status: 'available'
                      }, {
                        id: 2,
                        category: {
                          id: 2,
                          name: 'dog'
                        },
                        name: 'puppy',
                        photoUrls: [
                          'http://example.com/path/to/dog/1.jpg'
                        ],
                        tags: [{
                          id: 2,
                          name: 'dog'
                        }],
                        status: 'available'
                      }]
                    }
                  ]
                },
                {
                  type: 'op.responses',
                  responses: [
                    {
                      status: '200',
                      description: 'successful operation',
                      primary: {
                        mediaType: 'application/json',
                        schema: {
                          type: 'array',
                          items: {
                            '$ref': '#/components/schemas/Pet'
                          }
                        }
                      },
                      alternates: []
                    },
                    {
                      status: '400',
                      description: 'Invalid status value',
                      alternates: []
                    }
                  ]
                },
                {
                  type: 'op.security',
                  requirements: [
                    {
                      name: 'petstore_auth',
                      scopes: ['write:pets', 'read:pets']
                    }
                  ]
                }
              ]
            },
            {
              type: "section",
              title: "Finds Pets by status",
              level: 3,
              children: [
                {
                  type: 'overview.description',
                  body: 'Multiple status values can be provided with comma separated strings'
                },
                {
                  type: 'op.parameters',
                  groups: [
                    {
                      in: 'query',
                      title: 'Query',
                      items: [
                        {
                          kind: 'param',
                          name: 'status',
                          in: 'query',
                          required: true,
                          description: 'Status values that need to be considered for filter',
                          type: {
                            type: 'array',
                            items: {
                              type: 'string',
                              enum: ['available', 'pending', 'sold'],
                              default: 'available'
                            }
                          },
                          examples: [
                            {
                              summary: 'Available',
                              description: 'Showing status of `available`, using `value` property',
                              value: 'available'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  type: 'op.example',
                  mediaType: 'application/json',
                  examples: [
                    {
                      summary: 'Example response showing a regular response',
                      description: 'Two pets are returned in this example.',
                      value: [{
                        id: 1,
                        category: {
                          id: 1,
                          name: 'cat'
                        },
                        name: 'fluffy',
                        photoUrls: [
                          'http://example.com/path/to/cat/1.jpg',
                          'http://example.com/path/to/cat/2.jpg'
                        ],
                        tags: [{
                          id: 1,
                          name: 'cat'
                        }],
                        status: 'available'
                      }, {
                        id: 2,
                        category: {
                          id: 2,
                          name: 'dog'
                        },
                        name: 'puppy',
                        photoUrls: [
                          'http://example.com/path/to/dog/1.jpg'
                        ],
                        tags: [{
                          id: 2,
                          name: 'dog'
                        }],
                        status: 'available'
                      }]
                    }
                  ]
                },
                {
                  type: 'op.responses',
                  responses: [
                    {
                      status: '200',
                      description: 'successful operation',
                      primary: {
                        mediaType: 'application/json',
                        schema: {
                          type: 'array',
                          items: {
                            '$ref': '#/components/schemas/Pet'
                          }
                        }
                      },
                      alternates: []
                    },
                    {
                      status: '400',
                      description: 'Invalid status value',
                      alternates: []
                    }
                  ]
                },
                {
                  type: 'op.security',
                  requirements: [
                    {
                      name: 'petstore_auth',
                      scopes: ['write:pets', 'read:pets']
                    }
                  ]
                }
              ]
            },
            {
              type: "section",
              title: "Add a new pet to the store",
              level: 3,
              children: [
                {
                  type: 'op.requestBody',
                  description: 'Pet object that needs to be added to the store',
                  required: true,
                  mediaTypes: [
                    {
                      mediaType: 'application/json',
                      schema: {
                        '$ref': '#/components/schemas/Pet'
                      }
                    },
                    {
                      mediaType: 'application/xml',
                      schema: {
                        '$ref': '#/components/schemas/Pet'
                      }
                    }
                  ]
                },
                {
                  type: 'op.parameters',
                  groups: [
                    {
                      in: 'body',
                      title: 'Body',
                      items: [
                        {
                          kind: 'param',
                          name: 'id',
                          in: 'body',
                          required: false,
                          description: '',
                          type: {
                            type: 'integer',
                            format: 'int64'
                          },
                          examples: []
                        },
                        {
                          kind: 'param',
                          name: 'category',
                          in: 'body',
                          required: false,
                          description: '',
                          type: {
                            '$ref': '#/components/schemas/Category'
                          },
                          examples: []
                        },
                        {
                          kind: 'param',
                          name: 'name',
                          in: 'body',
                          required: true,
                          description: '',
                          type: {
                            type: 'string',
                            example: 'doggie'
                          },
                          examples: ['doggie']
                        },
                        {
                          kind: 'param',
                          name: 'photoUrls',
                          in: 'body',
                          required: true,
                          description: '',
                          type: {
                            type: 'array',
                            xml: {
                              name: 'photoUrl',
                              wrapped: true
                            },
                            items: {
                              type: 'string'
                            }
                          },
                          examples: []
                        },
                        {
                          kind: 'param',
                          name: 'tags',
                          in: 'body',
                          required: false,
                          description: '',
                          type: {
                            type: 'array',
                            xml: {
                              name: 'tag',
                              wrapped: true
                            },
                            items: {
                              '$ref': '#/components/schemas/Tag'
                            }
                          },
                          examples: []
                        },
                        {
                          kind: 'param',
                          name: 'status',
                          in: 'body',
                          required: false,
                          description: 'pet status in the store',
                          type: {
                            type: 'string',
                            description: 'pet status in the store',
                            enum: ['available', 'pending', 'sold']
                          },
                          examples: []
                        }
                      ]
                    }
                  ]
                },
                {
                  type: 'op.example',
                  mediaType: 'application/json',
                  examples: [
                    {
                      summary: 'An example of cat',
                      description: 'An example of cat, using `value` property',
                      value: {
                        id: 1,
                        category: {
                          id: 1,
                          name: 'cat'
                        },
                        name: 'fluffy',
                        photoUrls: [
                          'http://example.com/path/to/cat/1.jpg',
                          'http://example.com/path/to/cat/2.jpg'
                        ],
                        tags: [{
                          id: 1,
                          name: 'cat'
                        }],
                        status: 'available'
                      }
                    },
                    {
                      summary: 'An example of cat',
                      description: 'An example of cat, using `value` property, which value is an array',
                      value: [{
                        id: 1,
                        category: {
                          id: 1,
                          name: 'cat'
                        },
                        name: 'fluffy',
                        photoUrls: [
                          'http://example.com/path/to/cat/1.jpg',
                          'http://example.com/path/to/cat/2.jpg'
                        ],
                        tags: [{
                          id: 1,
                          name: 'cat'
                        }],
                        status: 'available'
                      }]
                    },
                    {
                      summary: 'An example of dog',
                      description: 'An example of dog, using `externalValue` property',
                      externalValue: 'http://example.com/examples/dog.json'
                    }
                  ]
                },
                {
                  type: 'op.example',
                  mediaType: 'application/xml',
                  examples: [
                    {
                      summary: 'An example of cat',
                      description: 'An example of cat, using `value` property',
                      value: '<xml></xml>'
                    },
                    {
                      summary: 'An example of dog',
                      description: 'An example of dog, using `externalValue` property',
                      externalValue: 'http://example.com/examples/dog.xml'
                    }
                  ]
                },
                {
                  type: 'op.responses',
                  responses: [
                    {
                      status: '405',
                      description: 'Invalid input',
                      alternates: []
                    }
                  ]
                }
              ]
            }
],
            }
          ]
        }   
      ]
    }

  assert.deepEqual(pageContainer, expected);
})