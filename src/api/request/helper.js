const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const requestHtmlTemplate = (toUser = {}, fromUser = {}) => {
  const toUserName = `${toUser?.firstName || ''} ${toUser?.lastName || ''}`.trim() || 'Developer';
  const fromUserName = `${fromUser?.firstName || ''} ${fromUser?.lastName || ''}`.trim() || 'A developer';
  const fromUserAbout = fromUser?.about || 'Excited to connect with you on DevTinder.';
  const fromUserSkills = Array.isArray(fromUser?.skills) ? fromUser.skills.slice(0, 6) : [];
  const profileImage =
    fromUser?.profileImage ||
    'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png';

  const skillsMarkup = fromUserSkills.length
    ? fromUserSkills
        .map(
          (skill) =>
            `<span style="display:inline-block;margin:0 8px 8px 0;padding:6px 12px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:600;">${escapeHtml(skill)}</span>`,
        )
        .join('')
    : '<span style="color:#6b7280;font-size:13px;">Skills will be visible on profile</span>';

  return `
    <div style="background:#f3f4f6;padding:32px 14px;font-family:Arial,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(17,24,39,0.08);">
        <div style="background:linear-gradient(120deg,#4f46e5,#06b6d4);padding:24px 26px;color:#ffffff;">
          <h2 style="margin:0;font-size:24px;line-height:1.2;">New Connection Request 🚀</h2>
          <p style="margin:10px 0 0;font-size:14px;opacity:0.95;">Someone wants to connect with you on DevTinder</p>
        </div>

        <div style="padding:24px 26px;">
          <p style="margin:0 0 14px;font-size:16px;">Hi <b>${escapeHtml(toUserName)}</b>,</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.65;">
            You have received a connection request from <b>${escapeHtml(fromUserName)}</b> on DevTinder.
          </p>

          <div style="border:1px solid #e5e7eb;border-radius:14px;padding:18px;background:#fafafa;">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
              <img src="${escapeHtml(profileImage)}" alt="${escapeHtml(fromUserName)}" width="64" height="64" style="border-radius:50%;object-fit:cover;border:2px solid #e0e7ff;" />
              <div>
                <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(fromUserName)}</p>
                <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Requested to connect with you</p>
              </div>
            </div>

            <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(fromUserAbout)}</p>
            <div style="margin-top:8px;">${skillsMarkup}</div>
          </div>

          <div style="margin-top:24px;">
            <a href="https://tinder-dev.in/requests" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
              Review Request
            </a>
          </div>
        </div>

        <div style="padding:14px 26px;border-top:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;">
          This is an automated email from DevTinder. Please do not reply to this message.
        </div>
      </div>
    </div>
  `;
};

module.exports = {
  requestHtmlTemplate,
};
