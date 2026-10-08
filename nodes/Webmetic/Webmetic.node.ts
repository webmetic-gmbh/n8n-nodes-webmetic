import {
  INodeRequestOutput,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from "n8n-workflow";

// Version 2 outputs one item per company; version 1 (existing workflows)
// keeps the single item holding the `result` array.
const oneItemPerCompany: INodeRequestOutput = {
  postReceive: [
    {
      type: "rootProperty",
      enabled: "={{ $version >= 2 }}",
      properties: { property: "result" },
    },
  ],
};

export class Webmetic implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Webmetic",
    name: "webmetic",
    icon: "file:webmetic.svg",
    group: ["transform"],
    version: [1, 2],
    defaultVersion: 2,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Get the companies visiting your website and contact persons at them",
    defaults: {
      name: "Webmetic",
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: "webmeticApi",
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: "https://hub.webmetic.de",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "New Visits",
            value: "newVisits",
            description:
              "Get companies that have visited a domain for the first time",
          },
          {
            name: "Intensive Visits",
            value: "intensiveVisits",
            description:
              "Get companies that have had intensive visits to a domain",
          },
          {
            name: "Returning Visits",
            value: "returningVisits",
            description:
              "Get companies that have visited a domain multiple times",
          },
          {
            name: "Contact",
            value: "contact",
            description:
              "Find a contact person at a company that visited your website",
          },
        ],
        default: "newVisits",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["newVisits"],
          },
        },
        options: [
          {
            name: "Get",
            value: "get",
            action: "Get new visits",
            description:
              "Get a list of companies that have visited the specified domain for the first time",
            routing: {
              request: {
                method: "GET",
                url: "/new-visits",
              },
              output: oneItemPerCompany,
            },
          },
        ],
        default: "get",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["intensiveVisits"],
          },
        },
        options: [
          {
            name: "Get",
            value: "get",
            action: "Get intensive visits",
            description:
              "Get a list of companies that have had intensive visits to the specified domain",
            routing: {
              request: {
                method: "GET",
                url: "/intensive-visits",
              },
              output: oneItemPerCompany,
            },
          },
        ],
        default: "get",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["returningVisits"],
          },
        },
        options: [
          {
            name: "Get",
            value: "get",
            action: "Get returning visits",
            description:
              "Get a list of companies that have visited the specified domain multiple times",
            routing: {
              request: {
                method: "GET",
                url: "/returning-visits",
              },
              output: oneItemPerCompany,
            },
          },
        ],
        default: "get",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["contact"],
          },
        },
        options: [
          {
            name: "Find",
            value: "find",
            action: "Find a contact person",
            description:
              "Find the first contact person matching your filters and reveal their e-mail or phone number (costs credits)",
            routing: {
              request: {
                method: "POST",
                url: "/contacts/find",
              },
              output: {
                // Nobody fitting: no item, so the branch stops for this company
                postReceive: [
                  {
                    type: "filter",
                    properties: { pass: "={{ $responseItem.found }}" },
                  },
                ],
              },
            },
          },
        ],
        default: "find",
      },
      {
        displayName: "Company ID",
        name: "companyId",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["contact"],
            operation: ["find"],
          },
        },
        default: "={{ $json.company_id }}",
        description:
          "The company_id of a company that visited your website, e.g. from a Webmetic visits node. Contacts are only available for identified visitors.",
        routing: {
          send: {
            type: "body",
            property: "company_id",
          },
        },
      },
      {
        displayName: "Reveal",
        name: "reveal",
        type: "options",
        displayOptions: {
          show: {
            resource: ["contact"],
            operation: ["find"],
          },
        },
        options: [
          {
            name: "Email and LinkedIn (2 Credits)",
            value: "email",
          },
          {
            name: "Phone Numbers (8 Credits)",
            value: "phone",
          },
          {
            name: "Email and Phone (10 Credits)",
            value: "both",
          },
        ],
        default: "email",
        description:
          "Which contact data to reveal. Only delivered data is charged, data you revealed before is free.",
        routing: {
          send: {
            type: "body",
            property: "reveal",
          },
        },
      },
      // Same choices as the contact setup in the dashboard (icp/types.ts):
      // department groups, each worth one or more provider departments, and
      // one minimum level for all of them.
      {
        displayName: "Departments",
        name: "departments",
        type: "multiOptions",
        displayOptions: {
          show: {
            resource: ["contact"],
            operation: ["find"],
          },
        },
        options: [
          { name: "Business Development", value: "Business Development" },
          { name: "Finance & Legal", value: "Finance,Legal" },
          { name: "HR", value: "Human Resources" },
          { name: "Management", value: "General Management" },
          { name: "Marketing", value: "Marketing" },
          { name: "Sales", value: "Sales" },
          {
            name: "Tech & Product",
            value: "Engineering & Technical,Information Technology,Product",
          },
        ],
        default: [],
        description:
          "Leave empty to use the departments from your contact setup in the Webmetic dashboard",
        routing: {
          send: {
            type: "body",
            property: "filters.departments",
            value: '={{ $value.length ? $value.flatMap(v => v.split(",")) : undefined }}',
          },
        },
      },
      {
        displayName: "Minimum Level",
        name: "minimumLevel",
        type: "options",
        displayOptions: {
          show: {
            resource: ["contact"],
            operation: ["find"],
          },
        },
        options: [
          { name: "Same as Webmetic Setup", value: 0 },
          { name: "Manager and Above", value: 4 },
          { name: "Division Lead and Above", value: 6 },
          { name: "Executives Only", value: 9 },
        ],
        default: 0,
        routing: {
          send: {
            type: "body",
            property: "filters.seniority",
            value:
              "={{ $value ? [10, 9, 8, 7, 6, 5, 4].filter(level => level >= $value) : undefined }}",
          },
        },
      },
      {
        displayName: "Domain",
        name: "domain",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["newVisits", "intensiveVisits", "returningVisits"],
            operation: ["get"],
          },
        },
        default: "",
        placeholder: "example.com",
        description: "The domain name for retrieving company visit data",
        routing: {
          request: {
            qs: {
              domain: "={{$value}}",
            },
          },
        },
      },
      {
        displayName: "Additional Fields",
        name: "additionalFields",
        type: "collection",
        default: {},
        placeholder: "Add Field",
        displayOptions: {
          show: {
            resource: ["newVisits", "intensiveVisits", "returningVisits"],
            operation: ["get"],
          },
        },
        options: [
          {
            displayName: "From Date",
            name: "from_date",
            type: "string",
            default: "-30 days",
            placeholder: "-30 days",
            description: "Starting date/time or relative date like '-30 days', '-12 hours', '-45 minutes'. Examples: '2023-01-01', '-7 days', '-30 minutes', 'now'",
            routing: {
              request: {
                qs: {
                  from_date: "={{$value}}",
                },
              },
            },
          },
          {
            displayName: "To Date",
            name: "to_date",
            type: "string",
            default: "now",
            placeholder: "now",
            description: "Ending date/time or 'now' for current date/time. Examples: '2023-01-31', '-15 minutes', 'now'",
            routing: {
              request: {
                qs: {
                  to_date: "={{$value}}",
                },
              },
            },
          },
        ],
      },
    ],
  };
}
