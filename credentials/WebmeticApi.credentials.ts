import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class WebmeticApi implements ICredentialType {
  name = "webmeticApi";
  displayName = "Webmetic API";
  documentationUrl = "https://www.npmjs.com/package/n8n-nodes-webmetic";
  properties: INodeProperties[] = [
    {
      displayName:
        'Visitor Intelligence API key: copy it from <a href="https://app.webmetic.de/?menu=api_details" target="_blank">API keys</a> in your Webmetic dashboard. It starts with wmtc_. No key yet? Click Generate key there.',
      name: "apiKeyNotice",
      type: "notice",
      default: "",
    },
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      required: true,
      placeholder: "wmtc_...",
      description: "The Visitor Intelligence API key from your Webmetic dashboard",
    },
  ];
  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "={{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://hub.webmetic.de",
      url: "/my-domains",
      method: "GET",
    },
    rules: [
      {
        type: "responseCode",
        properties: {
          value: 403,
          message:
            "Webmetic does not recognize this key. Copy the Visitor Intelligence key from app.webmetic.de, menu API keys.",
        },
      },
    ],
  };
}
