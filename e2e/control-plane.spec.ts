import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/wallet",
  "/organization",
  "/vaults",
  "/plans",
  "/studio",
  "/mock",
  "/proposals",
  "/approvals",
  "/audit",
];
const e2eMode = process.env.E2E_MODE === "live" ? "live" : "demo";

test.describe.configure({ mode: "serial" });

test("control-plane routes render without browser errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} status`).toBe(200);
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  }

  expect(consoleErrors, "console errors").toEqual([]);
  expect(pageErrors, "page errors").toEqual([]);
});

test("Mocknet walkthrough simulates the complete constrained-allocation lifecycle", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Walkthrough" }).click();
  await expect(page.getByRole("dialog", { name: "Inspect a mock funding UTXO" })).toBeVisible();
  await expect(page.getByText("Mocknet funding UTXO", { exact: true })).toBeVisible();
  await expect(page.getByText("Mocknet only.", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Open the Mocknet funding record" }).click();
  await expect(page).toHaveURL(/\/wallet$/);
  const walletStep = page.getByRole("dialog", { name: "Pair the operator identity" });
  await expect(walletStep).toBeVisible();
  await expect(walletStep.getByText("bch_signMessage", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Accept mock bch_signMessage login" }).click();
  await expect(page).toHaveURL(/\/vaults$/);
  await expect(page.getByRole("dialog", { name: "Attach the covenant vault" })).toBeVisible();
  await expect(page.getByText("Mocknet covenant vault", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Attach mock vault outpoint" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("dialog", { name: "Publish a bounded payment route" })).toBeVisible();
  await expect(page.getByText("0.05000000 BCH", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Publish mock vendor policy" }).click();
  await expect(page).toHaveURL(/\/proposals$/);
  await expect(
    page.getByRole("dialog", { name: "Bind an exact transaction intent" }),
  ).toBeVisible();
  await expect(page.getByText("Mocknet allocation proposal", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Create mock 0.02 BCH proposal" }).click();
  await expect(
    page.getByRole("dialog", { name: "Collect quorum on the same intent" }),
  ).toBeVisible();
  await expect(page.getByText("2 of 2 approvals · ready to build", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Record two mock approvals" }).click();
  await expect(
    page.getByRole("dialog", { name: "Validate the signed successor transaction" }),
  ).toBeVisible();
  await expect(
    page.getByText("signed · CashVM valid · preflight accepted", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Simulate: Mock-sign and run CashVM" }).click();
  await expect(page.getByRole("dialog", { name: "Confirm the Mocknet transition" })).toBeVisible();
  await expect(page.getByText("mocknet-confirmed", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Finish Mocknet demo" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("organization setup explains the WalletConnect-derived authority boundary", async ({
  page,
}) => {
  await page.goto("/organization", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Organization setup" })).toBeVisible();
  await expect(page.getByText("stores no keys", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Mocknet demo" })).toBeVisible();
  await page.getByRole("button", { name: "Run Mocknet demo" }).click();
  await expect(page.getByRole("dialog", { name: "Inspect a mock funding UTXO" })).toBeVisible();
});

test("Mocknet Studio compiles a visual template and builds an inspectable transaction", async ({
  page,
}) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Explore Mocknet Studio" }).click();
  await expect(page.getByRole("heading", { name: "Policy Studio sandbox" })).toBeVisible();
  await expect(
    page.getByText("Construct a mock Bounded Release contract", { exact: true }),
  ).toBeVisible();
  await page.getByText("Cap 5000000 sats · fee 2000 sats", { exact: true }).click();
  const limitsInspector = page.getByRole("dialog", { name: "Compiled payment and fee caps" });
  await expect(limitsInspector).toBeVisible();
  await expect(limitsInspector.getByText("operator editable", { exact: true })).toBeVisible();
  await limitsInspector.getByLabel("Payment cap (BCH)").fill("0.04");
  await expect(page.getByText("Cap 4000000 sats · fee 2000 sats", { exact: true })).toBeVisible();
  await limitsInspector.getByRole("button", { name: "Close graph element inspector" }).click();
  await page.getByText("Payout — output 0", { exact: true }).first().click();
  const paymentInspector = page.getByRole("dialog", { name: "Payment at transaction output 0" });
  await expect(paymentInspector).toBeVisible();
  await expect(
    paymentInspector.getByText("The output lock remains fixed by the covenant", { exact: false }),
  ).toBeVisible();
  await paymentInspector.getByRole("button", { name: "Close graph element inspector" }).click();
  await page.getByText("Controlled remainder — output 1", { exact: true }).click();
  const successorInspector = page.getByRole("dialog", {
    name: "Controlled successor at transaction output 1",
  });
  await expect(successorInspector.getByText("read-only invariant", { exact: true })).toBeVisible();
  await expect(
    successorInspector.getByText("output position are safety invariants", { exact: false }),
  ).toBeVisible();
  await successorInspector.getByRole("button", { name: "Close graph element inspector" }).click();
  await page.getByRole("button", { name: "Build unsigned mock transaction" }).click();
  await expect(page.getByText("Local build in progress", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Bind the owner authorization and source covenant UTXO.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Local build passed", { exact: true })).toBeVisible();
  await expect(page.getByText("Policy and covenant checks pass", { exact: true })).toBeVisible();
  await expect(page.getByText("Output 0 · payment", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Generated CashAssembly redeem source", { exact: true }),
  ).toBeVisible();
});

test("full mock workspace keeps template, instance, vault UTXO, and transition evidence synchronized", async ({
  page,
}) => {
  await page.goto("/mock", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "OPTN Control Plane workspace" })).toBeVisible();
  await expect(
    page.getByText("Assets are outputs, not an account balance", { exact: true }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Issuance Lab" }).click();
  await expect(
    page.getByRole("heading", { name: "Construct a mock genesis transaction" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simulate genesis issuance" }).click();
  await expect(page.getByText("Mock issuance ready to inspect", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Can create additional NFTs in this category; it cannot increase fungible supply.",
      {
        exact: true,
      },
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Control Studio" }).click();
  await expect(
    page.getByRole("heading", { name: "One graph, one contract instance, one transaction shape" }),
  ).toBeVisible();
  await page.getByLabel("Maximum payment (BCH)").fill("0.5");
  await expect(page.getByText("candidate v2", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("Changing a constructor value creates an unfunded candidate.", { exact: false }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Transaction shape" }).click();
  await page.getByLabel("Payment (BCH)").fill("0.75");
  await page.getByRole("button", { name: "Validate local transition" }).click();
  await expect(page.getByText("Permitted mock transition", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Output 1 retains the same covenant lock", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Apply local successor state" }).click();

  await page.getByRole("button", { name: "Lineage", exact: true }).click();
  await expect(page.getByText("mock:transition-1:1", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("NOT YET A UTXO", { exact: false })).toBeVisible();
});

test("FlowGuard-guided visual templates stay visibly non-executable until implemented", async ({
  page,
}) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Explore Mocknet Studio" }).click();
  await page.getByRole("button", { name: "Recurring payment" }).click();
  await expect(page.getByRole("heading", { name: "Recurring payment visualizer" })).toBeVisible();
  await expect(page.getByText("Schedule UTXO + state NFT", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Reference template — implementation gate", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("cannot compile or fund", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Build unsigned mock transaction" })).toHaveCount(
    0,
  );
});

test("executable Studio explains a selected UTXO and CashAssembly control", async ({ page }) => {
  test.skip(
    e2eMode !== "demo",
    "The deterministic demo vault supplies the executable Studio graph.",
  );
  await page.goto("/wallet", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Alice (DEMO)" }).click();
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Executable BCH transaction mapping", { exact: true })).toBeVisible();
  await page.getByText("Payment — output 0", { exact: true }).first().click();
  await expect(page.getByText("Selected graph element", { exact: true })).toBeVisible();
  await expect(page.getByText("Payment output 0", { exact: true })).toBeVisible();
  await expect(page.getByText("CashAssembly rule", { exact: true })).toBeVisible();
  await expect(page.getByText("Output 0 is locked to", { exact: false })).toBeVisible();
});

test("demo approval, deterministic build, and local VM validation lifecycle", async ({ page }) => {
  test.skip(
    e2eMode !== "demo",
    "The deterministic demo lifecycle runs only on the isolated demo server.",
  );
  await page.goto("/wallet", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Alice (DEMO)" }).click();
  await expect(page.getByText("Current session")).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: "owner" })).toBeVisible();

  await page.goto("/proposals", { waitUntil: "domcontentloaded" });
  const createButton = page.getByRole("button", { name: "New 0.02 BCH proposal" });
  await expect(createButton).toBeEnabled();
  await createButton.click();

  const proposalLink = page.locator('a[href^="/proposals/"]').first();
  await expect(proposalLink).toBeVisible();
  const proposalHref = await proposalLink.getAttribute("href");
  expect(proposalHref).toMatch(/^\/proposals\/[^/]+$/);
  await page.goto(proposalHref!, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: "Demo approve as owner" })).toBeVisible();
  await page.getByRole("button", { name: "Demo approve as owner" }).click();
  await expect(page.getByText(/Off-chain approval policy 1\/2/)).toBeVisible();

  await page.goto("/wallet", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("No authenticated operator.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Bob (DEMO)" }).click();
  await expect(page.locator("dd").filter({ hasText: "approver" })).toBeVisible();
  await page.goto(proposalHref!, { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Demo approve as approver" }).click();
  await expect(page.getByText(/Off-chain approval policy 2\/2/)).toBeVisible();

  // Building and local demo signing are operator actions, so return to Alice
  // after Bob supplies the second off-chain approval.
  await page.goto("/wallet", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("No authenticated operator.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Alice (DEMO)" }).click();
  await expect(page.locator("dd").filter({ hasText: "owner" })).toBeVisible();
  await page.goto(proposalHref!, { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Build unsigned tx" }).click();
  const localSignButton = page.getByRole("button", { name: "Local VM sign (DEMO)" });
  await expect(localSignButton).toBeEnabled();
  await localSignButton.click();
  await expect(page.getByText("Locally VM validated", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Broadcast" })).toBeDisabled();
});

test("live configuration exposes the Chipnet WalletConnect login boundary", async ({ page }) => {
  test.skip(
    e2eMode !== "live",
    "The live configuration check runs against the WalletConnect-configured server.",
  );
  await page.goto("/wallet", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("bch:bchtest", { exact: true })).toBeVisible();
  await expect(page.getByText("Project id present", { exact: true })).toBeVisible();
  const connectButton = page.getByRole("button", { name: "Generate pairing QR" });
  await expect(connectButton).toBeEnabled();
  await expect(page.getByText("No authenticated operator.", { exact: true })).toBeVisible();

  await connectButton.click();
  await expect(page.getByTestId("walletconnect-uri")).toHaveText(/^wc:/, { timeout: 15_000 });
  await expect(page.getByTestId("walletconnect-uri")).not.toContainText("pairing:wc:");
  await expect(page.getByRole("img", { name: "WalletConnect pairing QR code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy raw URI" })).toBeEnabled();
});

test("live overview reports provider-observed Chipnet state without fixture balances", async ({
  page,
}) => {
  test.skip(e2eMode !== "live", "The chain provider check runs only against the live server.");
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const tip = page.getByText("Chipnet tip", { exact: true }).locator("..").locator("p").nth(1);
  await expect(tip).toHaveText(/^\d{1,3}(,\d{3})+$/);
  await expect(page.getByText(/^Live · Fulcrum /)).toBeVisible();
  await expect(page.getByText(/electrum-chipnet\.optnlabs\.com:50004/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("fixture · deterministic fixture");
  await expect(page.locator("body")).not.toContainText("12.625 BCH");
  await expect(page.locator("body")).not.toContainText("Chain provider unavailable");
});
