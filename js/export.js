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

    // Show share modal
    showShareModal() {
        const modal = document.getElementById('share-modal');
        modal.classList.remove('hidden');
    },

    // Hide share modal
    hideShareModal() {
        const modal = document.getElementById('share-modal');
        modal.classList.add('hidden');
    },

    // Share to Twitter
    async shareToTwitter() {
        const text = 'Check out my blackout poetry creation!';
        const url = 'https://teegardenmath.github.io/dailybread';
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

        window.open(twitterUrl, '_blank');
    },

    // Share to Facebook
    async shareToFacebook() {
        const url = 'https://teegardenmath.github.io/dailybread';
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

        window.open(facebookUrl, '_blank');
    },

    // Copy link to clipboard
    async copyLink() {
        const url = 'https://teegardenmath.github.io/dailybread';

        try {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('Link copied to clipboard!');
        }
    }
};
