import React from 'react';
import styles from './Footer.module.css';

interface Props {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
}

const Footer: React.FC<Props> = ({ onTermsClick, onPrivacyClick }) => (
  <footer className={styles.footer}>
    <div className={styles.inner}>

      <div className={styles.bottom}>
        <div className={styles.companyInfo}>
          <p>
            <span>MOIDA 주식회사</span>
            <span className={styles.sep}>|</span>
            <span>대표 MOIDA</span>
            <span className={styles.sep}>|</span>
            <span>사업자등록번호 000-00-00000</span>
          </p>
          <p>
            <span>서울특별시 강남구 테헤란로 123, 바자빌딩 4층</span>
            <span className={styles.sep}>|</span>
            <span>통신판매업신고 2025-서울강남-0001</span>
          </p>
          <p>
            <span>고객센터 1588-0000</span>
            <span className={styles.sep}>|</span>
            <span>평일 10:00 – 18:00 (주말·공휴일 휴무)</span>
            <span className={styles.sep}>|</span>
            <span>moida@modia.co.kr</span>
          </p>
        </div>
        <p className={styles.copyright}>© 2026 MOIDA Inc. All rights reserved.</p>
      </div>

    </div>
  </footer>
);

export default Footer;
