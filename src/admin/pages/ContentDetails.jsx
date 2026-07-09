import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FolderOpen,
  Calendar,
  Video,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { contentService } from "../../services/api";
import "./ContentDetails.css";

export default function ContentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    try {
      const res = await contentService.getById(id);
      console.log("Post:", res.data);
      setContent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loader"></div>
        <p>Loading Content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="details-loading">
        <h2>Content Not Found</h2>
      </div>
    );
  }

  const fileUrl = content.imageName
    ? contentService.getFileUrl(content.imageName)
    : "";
  console.log("fileUrl:", fileUrl);
  const extension =
    content.imageName?.split(".").pop()?.toLowerCase() || "";

  const uploadDate = content.addedDate
    ? `${content.addedDate[2]}/${content.addedDate[1]}/${content.addedDate[0]}`
    : "";

  return (
    <div className="details-page">
      {/* Header */}
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <h2>Content Details</h2>
      </div>

      {/* Main Card */}
      <div className="details-card">
        <h1>{content.title}</h1>

        <div className="details-info">

          <div className="info-item">
            <FolderOpen size={18} />
            <span>{content.category?.categoryTitle}</span>
          </div>

          <div className="info-item">
            <User size={18} />
            <span>{content.user?.name}</span>
          </div>

          <div className="info-item">
            <Calendar size={18} />
            <span>{uploadDate}</span>
          </div>

          {content.mentor && (
            <div className="info-item">
              <User size={18} />
              <span>Mentor: {content.mentor}</span>
            </div>
          )}

        </div>

        {content.content && (
          <div className="description-box">
            <h3>Description</h3>
            <p>{content.content}</p>
          </div>
        )}

        {content.videoLink && (
          <div className="video-link">
            <Video size={18} />
            <a
              href={
                content.videoLink.startsWith("http")
                  ? content.videoLink
                  : `https://${content.videoLink}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Video
            </a>
          </div>
        )}

        <div className="viewer">

          {/* Image */}
          {["jpg", "jpeg", "png", "gif", "webp"].includes(extension) && (
            <img
              src={fileUrl}
              alt={content.title}
              className="content-image"
            />
          )}

          {/* PDF */}
          {extension === "pdf" && (
            <div className="pdf-viewer">

              <div className="pdf-warning">
                <FileText size={18} />
                <span>
                  Your backend currently forces PDFs to download instead of
                  displaying inside the browser.
                </span>
              </div>

              <div className="pdf-buttons">

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <ExternalLink size={16} />
                  Open PDF
                </a>

                <a
                  href={fileUrl}
                  download
                  className="btn-secondary"
                >
                  <Download size={16} />
                  Download PDF
                </a>

              </div>
            </div>
          )}

          {/* Video */}
          {["mp4", "mov", "avi", "mkv", "webm"].includes(extension) && (
            <video controls className="content-video">
              <source src={fileUrl} />
              Your browser does not support video playback.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}