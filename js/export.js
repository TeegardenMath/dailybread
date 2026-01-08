// Export and Share Functionality
const ExportManager = {

    // Export as JPG
    async exportAsJPG() {
        try {
            const container = document.getElementById('poetry-canvas-container');

            // Use html2canvas to capture the entire container
            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                logging: false
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `blackout-poetry-${Date.now()}.jpg`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);

        } catch (error) {
            console.error('Error exporting as JPG:', error);
            alert('Failed to export as JPG. Please try again.');
        }
    },

    // Export as PNG (alternative to JPG)
    async exportAsPNG() {
        try {
            const container = document.getElementById('poetry-canvas-container');

            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `blackout-poetry-${Date.now()}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/png');

        } catch (error) {
            console.error('Error exporting as PNG:', error);
            alert('Failed to export as PNG. Please try again.');
        }
    },

    // Export as PDF
    async exportAsPDF() {
        try {
            const container = document.getElementById('poetry-canvas-container');

            // Capture as canvas first
            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Create PDF
            const { jsPDF } = window.jspdf;

            // Calculate dimensions
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;

            // A4 dimensions in mm
            let pdfWidth = 210;
            let pdfHeight = pdfWidth / ratio;

            // If height exceeds A4, scale down
            if (pdfHeight > 297) {
                pdfHeight = 297;
                pdfWidth = pdfHeight * ratio;
            }

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add image to PDF
            const x = (pdf.internal.pageSize.getWidth() - pdfWidth) / 2;
            const y = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight);

            // Add footer with attribution
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text('Created with Daily Bread - https://teegardenmath.github.io/dailybread',
                     pdf.internal.pageSize.getWidth() / 2,
                     pdf.internal.pageSize.getHeight() - 5,
                     { align: 'center' });

            // Save PDF
            pdf.save(`blackout-poetry-${Date.now()}.pdf`);

        } catch (error) {
            console.error('Error exporting as PDF:', error);
            alert('Failed to export as PDF. Please try again.');
        }
    },

    // Generate image blob for sharing
    async generateImageBlob() {
        const container = document.getElementById('poetry-canvas-container');

        const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
        });

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    },

    // Show share modal
    async showShareModal() {
        // Check if Web Share API with files is supported
        if (navigator.share && navigator.canShare) {
            // Try to use native share directly
            try {
                const blob = await this.generateImageBlob();
                const file = new File([blob], `blackout-poetry-${Date.now()}.png`, { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'My Blackout Poetry',
                        text: 'Check out my blackout poetry! Create your own at:',
                        url: 'https://teegardenmath.github.io/dailybread'
                    });
                    return;
                }
            } catch (error) {
                // If native share fails or is cancelled, fall through to modal
                if (error.name === 'AbortError') {
                    return; // User cancelled, do nothing
                }
                console.log('Native share not available, showing modal');
            }
        }

        // Fallback to modal
        const modal = document.getElementById('share-modal');
        modal.classList.remove('hidden');
    },

    // Hide share modal
    hideShareModal() {
        const modal = document.getElementById('share-modal');
        modal.classList.add('hidden');
    },

    // Share to Twitter with image
    async shareToTwitter() {
        try {
            // Download the image first
            const blob = await this.generateImageBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `blackout-poetry-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            // Then open Twitter with text
            const text = 'Check out my blackout poetry! Create your own at:';
            const siteUrl = 'https://teegardenmath.github.io/dailybread';
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + siteUrl)}`;

            setTimeout(() => {
                window.open(twitterUrl, '_blank');
                alert('Your image has been downloaded! Please attach it to your tweet.');
            }, 500);
        } catch (error) {
            console.error('Error sharing to Twitter:', error);
            alert('Failed to prepare share. Please try exporting as JPG instead.');
        }
    },

    // Share to Facebook with image
    async shareToFacebook() {
        try {
            // Download the image first
            const blob = await this.generateImageBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `blackout-poetry-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            // Then open Facebook
            const siteUrl = 'https://teegardenmath.github.io/dailybread';
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;

            setTimeout(() => {
                window.open(facebookUrl, '_blank');
                alert('Your image has been downloaded! Please attach it to your Facebook post.');
            }, 500);
        } catch (error) {
            console.error('Error sharing to Facebook:', error);
            alert('Failed to prepare share. Please try exporting as JPG instead.');
        }
    },

    // Copy link and download image
    async copyLink() {
        try {
            // Download the image first
            const blob = await this.generateImageBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `blackout-poetry-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            // Then copy the link
            const siteUrl = 'https://teegardenmath.github.io/dailybread';
            await navigator.clipboard.writeText(siteUrl);

            alert('Your image has been downloaded and the link copied to clipboard!');
        } catch (error) {
            console.error('Error copying link:', error);
            alert('Failed to copy link. Please try again.');
        }
    }
};
