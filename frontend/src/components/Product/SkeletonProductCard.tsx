import styles from "../../styles/Shop.module.css";

const SkeletonProductCard = () => {
  return (
    <div className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.imageContainer} />

      <div
        style={{
          height: "14px",
          width: "40%",
          background: "#eee",
          borderRadius: "4px",
          marginTop: "8px",
        }}
      />
      <div
        style={{
          height: "20px",
          width: "80%",
          background: "#eee",
          borderRadius: "4px",
          marginTop: "12px",
        }}
      />
      <div
        style={{
          height: "20px",
          width: "50%",
          background: "#eee",
          borderRadius: "4px",
          marginTop: "8px",
        }}
      />
    </div>
  );
};

export default SkeletonProductCard;
