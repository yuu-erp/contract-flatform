import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { FinsdkProvider, initDisplay } from "@meta-platform/ui";
import "@meta-platform/ui/styles.css";
import { Toaster } from "sonner";
import { App } from "./App";
import { isPreviewMock } from "./preview/env";
import { PreviewBootstrap } from "./preview/PreviewBootstrap";

initDisplay()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const tree = (
  <>
    <App />
    <Toaster richColors closeButton position="bottom-right" />
  </>
);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {isPreviewMock() ? (
      <PreviewBootstrap>{tree}</PreviewBootstrap>
    ) : (
      <FinsdkProvider basePath="/platform">{tree}</FinsdkProvider>
    )}
  </QueryClientProvider>,
);
