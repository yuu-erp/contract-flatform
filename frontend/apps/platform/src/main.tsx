import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { FinsdkProvider } from "@meta-platform/ui";
import "@meta-platform/ui/styles.css";
import { Toaster } from "sonner";
import { App } from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <FinsdkProvider basePath="/platform">
      <App />
      <Toaster richColors closeButton position="bottom-right" />
    </FinsdkProvider>
  </QueryClientProvider>,
);
