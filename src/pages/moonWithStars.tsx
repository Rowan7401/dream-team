import styles from '@/styles/MoonStars.module.css';

const craterSizes = ['small', 'medium', 'large', 'tiny', 'small', 'medium', 'small', 'tiny', 'tiny'];

const MoonWithStars = () => {
    return (
      <div className={styles.glowingMoon}>
      {craterSizes.map((size, i) => (
        <div key={i} className={`${styles.crater} ${styles[size]}`}></div>
      ))}
      </div>

  
    );
  };
  
  export default MoonWithStars;