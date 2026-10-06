

const url = "https://07b2d6f3-472a-42fe-83a9-0b10d8df796f.us-east-1.cloud.genez.io/api/sendsms";

async function sendSms(
    clients,
    message
) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clients, message }),
        });

        if (!response.ok) {
            console.error("SMS service returned status:", response.status);
        }
    } catch (error) {
        console.error("Error posting SMS:", error);
    }
}

module.exports = sendSms;