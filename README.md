# Earn and Engage extension proof of concept
This is the minimal setup and steps to get the extension to work.

The extension should be displayed in the checkout and get the user and products details and send them to the main app backend.

## Prerequisites

- a shopify partners account
- a shopify store to test against
- install the extension in the store
- make a new app in the partner account
- add access to protected data from apps->app->api access->protected customer data access->chose the data and the appropriate reasons
- add read_customers, read_orders, read_products to the scopes in the shopify toml config
- add the redirect url to apps->app->configuration->urls->allowed redirection URL(s)

## Getting started

### Installing dependencies
At the main directory
Using npm:

```shell
npm install
```

Then to the backend directory

```shell
cd backend
npm install
```
This is just the bare minimum for the extension to work and needs to be built upon to enhance user experince and make a solid backend

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App extensions](https://shopify.dev/docs/apps/build/app-extensions)
- [Extension only apps](https://shopify.dev/docs/apps/build/app-extensions/build-extension-only-app)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
