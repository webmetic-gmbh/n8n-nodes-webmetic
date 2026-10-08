# n8n-nodes-webmetic

This is an n8n community node that lets you use Webmetic in your n8n workflows.

[Webmetic](https://webmetic.de) shows which companies visit your website, and finds the right contact person at them, for sales and marketing teams.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Before you start](#before-you-start)  
[Installation](#installation)  
[Connect your account](#connect-your-account)  
[Operations](#operations)  
[Your first workflow](#your-first-workflow)  
[If something goes wrong](#if-something-goes-wrong)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Before you start

1. **Your Visitor Intelligence API key.** In your Webmetic dashboard, open [API keys](https://app.webmetic.de/?menu=api_details) and copy the **Visitor Intelligence** key. It starts with `wmtc_`. No key yet? Click **Generate key** there.
2. **For contact persons only: the contact setup.** Open the [contact setup](https://app.webmetic.de/?menu=icp_settings) once, choose your target group and confirm. This also unlocks your welcome credits.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation and install `n8n-nodes-webmetic`.

## Connect your account

1. Add the **Webmetic** node to a workflow.
2. Under **Credential to connect with**, choose **Create new credential**.
3. Paste your Visitor Intelligence API key and click **Save**. n8n checks the key right away.

## Operations

* **New Visits** › Get: companies that visited your website for the first time
* **Intensive Visits** › Get: companies that spent a lot of time on your website
* **Returning Visits** › Get: companies that came back several times
* **Contact** › Find: a contact person at a company that visited your website, with e-mail or phone number (costs credits)

### Getting visits

- **Domain**: your website, exactly as it appears in your Webmetic dashboard (e.g. `example.com`).
- **From Date** and **To Date** (optional): the time window, by default the last 30 days. Relative times such as `-1 hour`, `-7 days` or `-45 minutes` work, as do dates like `2026-01-31` and `now`.

The node outputs one item per company, so the next node runs once for each company. Workflows created with an older version of this node (node version 1) keep receiving a single item that holds the `result` list.

### Finding a contact person

Add **Contact → Find** after a visits node. For each company it looks for contact persons, takes the first one who has the requested data on file, and reveals it.

- **Company ID**: filled in automatically from the visits node (`{{ $json.company_id }}`). Contacts are only available for companies that visited your website.
- **Departments** and **Minimum Level**: the same choices as the contact setup in your Webmetic dashboard. Leave them empty to use your setup.
- **Reveal**: e-mail and LinkedIn (2 credits), phone numbers (8 credits), or both (10 credits). You only pay for data that is delivered. Running the node again for the same company returns the same person for free.

The output contains `name`, `job_title`, `email`, `linkedin`, `direct_phone`, `mobile_phone` and `credits_remaining`. Contacts are limited to the company's country. `country_fallback: true` means nobody matched there and the contact may work at a sister company abroad.

If nobody fits at a company, the node outputs no item for it and nothing is charged.

## Your first workflow

**New companies every hour, with a contact person, to your sales team:**

1. **Schedule Trigger**: every hour.
2. **Webmetic** › New Visits › Get: your domain, **From Date** `-1 hour`. Match the time window to the schedule, otherwise the same companies come back on every run.
3. **Webmetic** › Contact › Find: Reveal **E-mail and LinkedIn** to start with.
4. **Send Email**, **Microsoft Teams** or **Slack**: for example "`{{ $json.company_name }}` visited our website. Contact: `{{ $json.name }}`, `{{ $json.job_title }}`, `{{ $json.email }}`".

## If something goes wrong

| Message in n8n | What to do |
|---|---|
| Webmetic does not recognize this API key | Use the **Visitor Intelligence** key from [API keys](https://app.webmetic.de/?menu=api_details), not the Enrichment or Data Layer key. |
| This domain is not in your Webmetic account | Enter the domain exactly as in your Webmetic dashboard, with or without `www.` |
| The contact setup in Webmetic is missing | Open the [contact setup](https://app.webmetic.de/?menu=icp_settings) once and confirm. |
| Not enough Webmetic credits | Top up via your credit balance at the top of the [Webmetic dashboard](https://app.webmetic.de). |
| This company has not visited your website | Pass the Company ID from a Webmetic visits node. |
| Too many requests to Webmetic | Webmetic allows one request per second. Add a **Wait** node between Webmetic nodes. |
| Find returns no item | Nobody at that company fits your departments and level. Nothing was charged. |

## Compatibility

* Tested with n8n 2.11
* Node version 2 needs this package from version 0.5.0 on

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Webmetic API reference](https://hub.webmetic.de/docs) for developers
