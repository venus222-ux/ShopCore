import { useEffect, useState } from "react";
import API from "../api";
import styles from "../styles/Success.module.css";
import { useCartStore } from "../store/useCartStore";
import {
  CheckCircle,
  Download,
  Home,
  AlertCircle,
  Loader2,
} from "lucide-react";

const Success = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [order, setOrder] = useState<any>(null);

  const clearCart = useCartStore((state) => state.clearCart);

  const downloadProduct = async (id: number, fileName: string) => {
    try {
      const res = await API.get(`/products/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `product-${id}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );

    if (!sessionId) {
      setStatus("error");
      return;
    }

    API.get(`/orders/verify?session_id=${sessionId}`)
      .then((res) => {
        setOrder(res.data.order);
        setStatus("success");
        clearCart();

        // 1. Auto-download doar pentru primul produs digital
        const firstDigital = res.data.order?.items?.find(
          (item: any) => item.asset_type === "digital"
        );

        if (firstDigital) {
          downloadProduct(firstDigital.product_id, firstDigital.name);
        }
      })
      .catch((err) => {
        if (err.response?.status === 202) {
          setTimeout(() => window.location.reload(), 2500);
          return;
        }
        setStatus("error");
      });
  }, [clearCart]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* LOADING */}
        {status === "loading" && (
          <div className={styles.state}>
            <Loader2 className={styles.spinner} size={46} />
            <h2 className={styles.title}>Verifying payment</h2>
            <p className={styles.subtitle}>
              Confirming your transaction securely...
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <>
            <div className={styles.iconSuccess}>
              <CheckCircle size={70} />
            </div>

            <h1 className={styles.title}>Payment successful</h1>

            {/* 3. Mesaj dinamic în funcție de tipul de produs */}
            <p className={styles.subtitle}>
              {order?.items?.some((i: any) => i.asset_type === "digital")
                ? "Your order is confirmed and your digital files are ready to download."
                : "Your order is confirmed. We'll start preparing your shipment shortly."}
            </p>

            <div className={styles.orderBox}>
              <div className={styles.orderId}>Order #{order?.id}</div>

              {order?.items?.map((item: any) => (
                <div key={item.product_id} className={styles.itemRow}>
                  <span>{item.name || "Digital Product"}</span>

                  {/* 2. Buton Download doar pentru produse digitale */}
                  {item.asset_type === "digital" && (
                    <button
                      onClick={() =>
                        downloadProduct(item.product_id, item.name)
                      }
                      className={styles.downloadBtn}
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <a href="/" className={styles.primaryBtn}>
              <Home size={18} />
              Back to store
            </a>
          </>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className={styles.state}>
            <AlertCircle className={styles.errorIcon} size={64} />

            <h1 className={styles.title}>Payment verification failed</h1>

            <p className={styles.subtitle}>
              We couldn’t verify your session. If you were charged, check your
              email or contact support.
            </p>

            <a href="/" className={styles.secondaryBtn}>
              Return home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Success;