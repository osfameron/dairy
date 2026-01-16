// npx mocha -u qunit

import assert from "assert";
import type { PageContainer } from "../index.ts";

suite("Basic tests");

test("basic", function () {
  const ir : Array<PageContainer> = [
    {
      "page": {
        "kind": "operation",
        "id": "op:get:/v4/organizations/{organizationId}/cloudAccounts",
        "title": "Get Cloud Accounts",
        "slug": "getCloudAccounts"
      },
      "blocks": [
        {
          "type": "op.header",
          "title": "Get Cloud Accounts",
          "method": "GET",
          "path": "/v4/organizations/{organizationId}/cloudAccounts",
          "operationId": "getCloudAccounts"
        },
        {
          "type": "op.description",
          "body": "Fetches the cloud account ID associated with the organization. Use this account ID when adding CMEK to other AWS databases in your organization.\n\nTo learn more, see [CMEK at Rest](https://docs.couchbase.com/cloud/security/cmek.html).\n\nIn order to access this endpoint, the provided API key must have at least one of the following roles:\n  - Organization Owner\n  - Project Creator\n  - Organization Member\n\nTo learn more, see [Organization, Project, and Database Access Overview](https://docs.couchbase.com/cloud/organizations/organization-projects-overview.html).\n"
        },
        {
          "type": "op.parameters",
          "groups": [
            {
              "in": "path",
              "title": "Path parameters",
              "items": [
                {
                  "kind": "param",
                  "name": "organizationId",
                  "in": "path",
                  "required": true,
                  "description": "The GUID4 ID of the organization.\n",
                  "type": {
                    "kind": "primitive",
                    "type": "string",
                    "format": "uuid"
                  },
                  "examples": []
                }
              ]
            }
          ]
        },
        {
          "type": "op.responses",
          "responses": [
            {
              "status": "200",
              "description": "Successfully fetched the cloud account ID associated with the organization.",
              "primary": {
                "mediaType": "application/json",
                "schema": {
                  "kind": "ref",
                  "refId": "schema:CloudAccounts",
                  "link": { "text": "CloudAccounts", "href": "/schemas/cloudaccounts.md" }
                },
                "expand": {
                      "mode": "inlinePreview",
                      "preview": {
                      "kind": "object",
                      "fields": [
                          { "name": "gcp-capella-project", "required": false, "type": { "kind": "primitive", "type": "string" } },
                          { "name": "aws-capella-account", "required": false, "type": { "kind": "primitive", "type": "string" } },
                          { "name": "azure-capella-subscription", "required": false, "type": { "kind": "primitive", "type": "string" } }
                      ],
                      "additionalProperties": { "allowed": false }
                      }
                }
              },
              "alternates": []
            },
            { "status": "403", "description": "", "primary": null, "alternates": [] },
            { "status": "404", "description": "", "primary": null, "alternates": [] },
            { "status": "429", "description": "", "primary": null, "alternates": [] },
            { "status": "500", "description": "", "primary": null, "alternates": [] }
          ]
        }
      ]
    }]

    console.log(ir)
    assert.ok("hello")
});

