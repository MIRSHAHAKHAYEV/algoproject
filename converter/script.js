document.addEventListener('DOMContentLoaded', async () => {
    // DOM elementlərini seçirik
    const rightButtons = document.querySelectorAll('.right-buttons>button');
    const leftButtons = document.querySelectorAll('.left-buttons>button');
    const leftFooterWrapper = document.querySelector('.left-footer-wrapper');
    const rightFooterWrapper = document.querySelector('.right-footer-wrapper');
    const leftInput = document.querySelector('.left-input');
    const rightInput = document.querySelector('.right-input');
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerWrapper = document.querySelector('.hamburger-wrapper');
    const API_KEY = "6bfbf7c927973f66d254bc66da6347c1"; // Valyuta məzənnələri üçün API açarı
    const errorWrapper = document.querySelector('.error-wrapper');
    let leftRate, rightRate; // Konversiya məzənnələri üçün dəyişənlər
    let activeInput = "left"; // Hansı input sahəsinin aktiv olduğunu izləyirik

    // Aktiv inputa əsasən digər inputun dəyərini yeniləyən funksiya
    function updateDependentInput() {
        if (activeInput === "left" && leftInput.value !== "") {
            const calculatedValue = (leftInput.value * leftRate).toFixed(5);
            if (!isNaN(calculatedValue)) {
                rightInput.value = calculatedValue;
            }
        } else if (activeInput === "right" && rightInput.value !== "") {
            const calculatedValue = (rightInput.value * rightRate).toFixed(5);
            if (!isNaN(calculatedValue)) {
                leftInput.value = calculatedValue;
            }
        }
    }

    // Sol tərəfdəki valyuta düymələrinə klikləmə hadisəsi
    leftButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            button.classList.add('active'); // Kliklənmiş düyməni aktiv edirik
            leftButtons.forEach((btn) => {
                if (btn !== button) btn.classList.remove('active'); // Digər düymələrdən 'active' sinfini silirik
            });
            await updateFooters(); // Məzənnələri yeniləyirik
            updateDependentInput(); // Əlaqəli inputu yeniləyirik (sağ input)
        });
    });

    // Sağ tərəfdəki valyuta düymələrinə klikləmə hadisəsi
    rightButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            button.classList.add('active'); // Kliklənmiş düyməni aktiv edirik
            rightButtons.forEach((btn) => {
                if (btn !== button) btn.classList.remove('active'); // Digər düymələrdən 'active' sinfini silirik
            });
            await updateFooters(); // Məzənnələri yeniləyirik
            updateDependentInput(); // Əlaqəli inputu yeniləyirik (sol input)
        });
    });

    // Sol input sahəsində dəyişiklik olduqda
    leftInput.addEventListener('input', (e) => {
        activeInput = "left"; // Aktiv inputu "sol" olaraq təyin edirik
        if (e.target.value.includes(',')) {
            e.target.value = e.target.value.replace(',', '.'); // Vergülü nöqtə ilə əvəz edirik
        }
        const calculatedValue = (e.target.value * leftRate).toFixed(5); // Sol məzənnəyə əsasən hesablanmış dəyəri əldə edirik
        if (!isNaN(calculatedValue)) {
            rightInput.value = calculatedValue; // Sağ inputu hesablanmış dəyər ilə yeniləyirik
        } else {
            rightInput.value = ""; // Dəyər düzgün deyilsə, sağ inputu təmizləyirik
        }
    });

    // Sağ input sahəsində dəyişiklik olduqda
    rightInput.addEventListener('input', (e) => {
        activeInput = "right"; // Aktiv inputu "sağ" olaraq təyin edirik
        if (e.target.value.includes(',')) {
            e.target.value = e.target.value.replace(',', '.'); // Vergülü nöqtə ilə əvəz edirik
        }
        const calculatedValue = (e.target.value * rightRate).toFixed(5); // Sağ məzənnəyə əsasən hesablanmış dəyəri əldə edirik
        if (!isNaN(calculatedValue)) {
            leftInput.value = calculatedValue; // Sol inputu hesablanmış dəyər ilə yeniləyirik
        } else {
            leftInput.value = ""; // Dəyər düzgün deyilsə, sol inputu təmizləyirik
        }
    });

    // Valyuta məzənnələrini yeniləyən funksiya
    async function updateFooters() {
        const leftActive = document.querySelector('.left-buttons > button.active');
        const rightActive = document.querySelector('.right-buttons > button.active');
        if (leftActive && rightActive) {
            if (leftActive.innerText !== rightActive.innerText) {
                const leftCurrency = leftActive.textContent.trim(); // Sol seçilmiş valyutanı alırıq
                const rightCurrency = rightActive.textContent.trim(); // Sağ seçilmiş valyutanı alırıq

                // API URL-ni qururuq
                const leftURL = `https://api.exchangerate.host/live?access_key=${API_KEY}&source=${leftCurrency}&currencies=${rightCurrency}`;
                try {
                    const response = await fetch(leftURL); // Məzənnə məlumatını çəkirik
                    const leftData = await response.json(); // Response-u parse edirik

                    if (leftData.success) {
                        leftRate = leftData.quotes[`${leftCurrency}${rightCurrency}`].toFixed(5); // Sol məzənnəni alırıq
                        rightRate = (1 / leftRate).toFixed(5); // Sağ məzənnəni (solun əksini) hesablayırıq
                        leftFooterWrapper.innerText = `1 ${leftCurrency} = ${leftRate} ${rightCurrency}`; // Sol footer-i yeniləyirik
                        rightFooterWrapper.innerText = `1 ${rightCurrency} = ${rightRate} ${leftCurrency}`; // Sağ footer-i yeniləyirik
                    } else {
                        console.error('Sol məlumatı çəkilmədi:', leftData.error); // Əgər məlumat alınmazsa, xətanı qeyd edirik
                    }
                } catch (error) {
                    console.error('Məlumat alınarkən xəta baş verdi:', error); // API çağırışında xəta baş verərsə, onu qeyd edirik
                }
            } else {
                leftRate = 1; // Əgər hər iki valyuta eynidirsə, məzənnəni 1 olaraq təyin edirik
                rightRate = 1;
                leftFooterWrapper.innerText = `1 ${leftActive.innerText} = 1 ${rightActive.innerText}`; // Footer-i yeniləyirik
                rightFooterWrapper.innerText = `1 ${rightActive.innerText} = 1 ${leftActive.innerText}`;
            }
        }
    }

    // Şəbəkə statusunu yeniləyən funksiya
    function updateNetworkStatus() {
        if (navigator.onLine) {
            errorWrapper.style.display = 'none'; // Əgər şəbəkə əlaqəsi varsa, xəta mesajını gizlədirik
        } else {
            errorWrapper.style.display = 'block'; // Əgər şəbəkə əlaqəsi yoxdursa, xəta mesajını göstəririk
        }
    }

    // Şəbəkə vəziyyətini izləyirik
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus(); // İlk vəziyyəti yoxlayırıq

    await updateFooters(); // Başlanğıcda məzənnələri yeniləyirik
});
