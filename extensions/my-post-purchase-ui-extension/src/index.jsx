import {
    extend,
    render,
    BlockStack,
    Button,
    CalloutBanner,
    Heading,
    Layout,
    TextBlock,
    TextContainer,
} from "@shopify/post-purchase-ui-extensions-react";

// Shopify extension entry point
extend("Checkout::PostPurchase::ShouldRender", async ({ storage }) => {
    const render = true;
    await storage.update({});
    return { render };
});

render("Checkout::PostPurchase::Render", App);

export function App({ inputData }) {
    const BACKEND_URL = "https://c067-37-217-91-139.ngrok-free.app";

    // Extract customerId and shop domain from inputData
    const { initialPurchase: { customerId, lineItems }, shop: { domain } } = inputData;

    console.log(inputData)
    // Function to fetch data
    const fetchData = async () => {
        try {
            let response = await fetch(`${BACKEND_URL}/customers/${customerId}?shop=${domain}`);
            console.log("Fetched data:", response);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <Layout
            maxInlineSize={0.95}
            media={[
                { viewportSize: "small", sizes: [1] },
                { viewportSize: "medium", sizes: [0.7] },
                { viewportSize: "large", sizes: [0.5] },
            ]}
        >
            <BlockStack spacing="loose">
                <CalloutBanner title="Order Confirmation">
                    <TextBlock>
                        the link for vendors to get their access token and store it in the db{`${BACKEND_URL}/auth?shop=${domain}`}
                    </TextBlock>
                    <TextBlock>
                        here we can prompt the user to accept the invite to the community
                    </TextBlock>
                    <Button onPress={fetchData}>Get</Button>
                </CalloutBanner>

                <BlockStack spacing="tight">
                    <TextContainer>
                        <Heading>Customer Information</Heading>
                    </TextContainer>
                </BlockStack>

                <BlockStack spacing="tight">
                    <TextContainer>
                        <Heading>Order Details</Heading>
                    </TextContainer>
                </BlockStack>

                <Button submit>Continue Shopping</Button>
            </BlockStack>
        </Layout>
    );
}
