import React from 'react';
import styles from './SignupPage.module.css';

interface Props {
    name: string;
    onNext: () => void;
}

const SocialSignupInfoPage: React.FC<Props> = ({ name, onNext }) => {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div style={{ width: 32 }} />
                <span className={styles.headerTitle}>추가 정보 등록</span>
                <div style={{ width: 32 }} />
            </div>

            <div className={styles.form}>
                <p className={styles.stepLabel}>{name}님, 환영합니다! 🎉</p>

                <div style={{ marginTop: 24, marginBottom: 32 }}>
                    <p style={{ marginBottom: 12, fontWeight: 600 }}>서비스 이용을 위해 추가 정보 등록이 필요합니다.</p>
                    <p style={{ color: '#666', marginBottom: 8 }}>다음 정보를 입력해주세요:</p>
                    <ul style={{ color: '#444', paddingLeft: 20, lineHeight: 2 }}>
                        <li>닉네임 (필수)</li>
                        <li>휴대폰 번호 (필수)</li>
                    </ul>
                </div>

                <button className={styles.nextBtn} onClick={onNext}>
                    다음
                </button>
            </div>
        </div>
    );
};

export default SocialSignupInfoPage;