import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class WebmeticApi implements ICredentialType {
  name = "webmeticApi";
  displayName = "Webmetic API";
  documentationUrl = "https://hub.webmetic.de/docs";
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      required: true,
      description: "Your Webmetic API key",
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
  };
}
