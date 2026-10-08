# n8n-nodes-webmetic

This is an n8n community node that lets you use Webmetic in your n8n workflows.

[Webmetic](https://webmetic.de) provides company visitor tracking data for sales and marketing teams.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

* **New Visits**
  * Get: Retrieve a list of companies that have visited a specified domain for the first time
* **Intensive Visits**
  * Get: Retrieve a list of companies that have had intensive visits to a specified domain
* **Returning Visits**
  * Get: Retrieve a list of companies that have visited a specified domain multiple times
* **Contact**
  * Find: Find a contact person at a company that visited your website and reveal their e-mail or phone number (costs credits)

## Credentials

To use this node, you need:

1. A Webmetic API key - Get yours from [Webmetic](https://webmetic.de)
2. Configure the API key in n8n's credentials

## Compatibility

* Requires n8n version 0.172.0 or later
* Tested with n8n version 1.0.0+

## Usage

1. Add the Webmetic node to your workflow
2. Create new Webmetic API credentials:
   - Enter your API key (starts with `wmtc_`)
3. Configure the node:
   - Select "New Visits", "Intensive Visits", or "Returning Visits" as the resource
   - Select "Get" as the operation
   - Enter the domain you want to track (e.g., `example.com`)
   - Optional: Configure additional fields for date filtering:
     - **From Date**: Start date or relative time period (default: "-30 days")
     - **To Date**: End date or "now" for current date (default: "now")
4. Execute the node to retrieve company visitor data

The node returns valuable sales intelligence about companies and their visiting behavior on your domain.

Since node version 2, the visit operations return one item per company, so the next node runs once per company. Workflows created with version 1 keep the single item holding the `result` array.

### Finding a contact person

Connect **Contact → Find** after a visits operation. For each company it searches the contacts at that company, takes the first one who has the requested data on file, and reveals it:

- **Company ID**: defaults to `{{ $json.company_id }}` from the visits node. Contacts are only available for companies that visited your website.
- **Reveal**: E-mail and LinkedIn (2 credits), phone numbers (8 credits), or both (10 credits). Only delivered data is charged; running the node again for the same company returns the same person for free.
- **Departments** and **Minimum Level**: the same choices as the contact setup in the Webmetic dashboard. Left empty, the target group from that setup applies.

The output has `name`, `job_title`, `email`, `linkedin`, `direct_phone`, `mobile_phone` and `credits_remaining`. Contacts are limited to the company's country; `country_fallback: true` means nobody matched there and the contact may work at a sister company. If nobody fits, the node outputs no item for that company and charges nothing.

Before the first use, complete the contact setup once in the Webmetic dashboard (app.webmetic.de → a company → Ansprechpartner). It records your consent and unlocks the welcome credits.

### Date Format Examples:
- **Relative times**: `-30 days`, `-12 hours`, `-45 minutes`, `-7 days`
- **Absolute dates**: `2023-01-01`, `2023-12-31`  
- **Current**: `now`
- **Minutes**: `-15 minutes`, `-30 minutes`, `-90 minutes`

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Webmetic API documentation](https://hub.webmetic.de/docs)