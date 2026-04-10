import { Resend } from "resend";
import notificationModel from "../model/notification.model.js";
import userModel from "../model/user.model.js";
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from "../config/env.config.js";

const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function sendEmailSafe({ to, subject, text }) {
  if (!resendClient || !to) return;

  try {
    await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Resend email failed:", error?.message || error);
  }
}

export async function createNotification({ userId, type, title, message, data = null, email = null }) {
  try {
    const notification = await notificationModel.create({
      user: userId,
      type,
      title,
      message,
      data,
    });

    await sendEmailSafe({
      to: email,
      subject: title,
      text: `${message}\n\nOpen Food Rescue dashboard for details.`,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function notifyNearbyReceiversForFood(foodItem) {
  try {
    const provider = await userModel.findById(foodItem.provider).select("latitude longitude organizationName name");
    const providerLat = toNumber(provider?.latitude);
    const providerLng = toNumber(provider?.longitude);
    if (providerLat === null || providerLng === null) return;

    const receivers = await userModel
      .find({ role: "receiver" })
      .select("_id email latitude longitude")
      .lean();

    const nearbyReceivers = receivers.filter((receiver) => {
      const lat = toNumber(receiver.latitude);
      const lng = toNumber(receiver.longitude);
      if (lat === null || lng === null) return false;
      return haversineKm(providerLat, providerLng, lat, lng) <= 8;
    });

    if (!nearbyReceivers.length) return;

    const providerName = provider?.organizationName || provider?.name || "Provider";
    const title = "New food available near you";
    const message = `${foodItem.title} from ${providerName} is now available for pickup.`;

    await Promise.all(
      nearbyReceivers.map((receiver) =>
        createNotification({
          userId: receiver._id,
          type: "new_food_nearby",
          title,
          message,
          data: { foodId: String(foodItem._id) },
          email: receiver.email,
        })
      )
    );
  } catch (error) {
    console.error("Error notifying nearby receivers:", error);
  }
}

export async function notifyProviderFoodClaimed({ providerId, providerEmail, foodTitle, claimId }) {
  await createNotification({
    userId: providerId,
    type: "food_claimed",
    title: "Your food item was claimed",
    message: `${foodTitle} has been claimed by a receiver.`,
    data: { claimId },
    email: providerEmail,
  });
}

export async function notifyReceiverClaimStatus({ receiverId, receiverEmail, foodTitle, status, claimId }) {
  await createNotification({
    userId: receiverId,
    type: "claim_status_update",
    title: "Your claim status changed",
    message: `Your claim for ${foodTitle} is now ${status}.`,
    data: { claimId, status },
    email: receiverEmail,
  });
}
