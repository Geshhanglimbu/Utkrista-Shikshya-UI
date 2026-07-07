import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Image, Video } from "lucide-react";
import { contentService } from "../../services/api";
import "./ContentDetails.css";

export default function CategoryDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {   
        loadContent();
    }, []);

   const loadContent = async () => {
    try {
        const res = await contentService.getById(id);

        console.log("Post", res.data);

        setContent(res.data);
    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
};
    if (loading)
        return (
            <div className="details-loading">
                Loading...
            </div>
        );

    if (!content)
        return (
            <div className="details-loading">
                Content not found.
            </div>
        );

    const fileUrl = contentService.getFileUrl(content.imageName);

    const extension =
        content.imageName?.split(".").pop().toLowerCase();

    return (
        <div className="details-page">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18}/>
                Back
            </button>

            <div className="details-card">

                <h1>{content.title}</h1>

                <div className="details-meta">

                    <span>
                        <FileText size={15}/>
                        {content.category?.categoryTitle}
                    </span>

                    <span>
                        Uploaded by {content.user?.name}
                    </span>

                </div>

                <div className="viewer">

                    {["jpg","jpeg","png","gif","webp"].includes(extension) && (

                        <img
                            src={fileUrl}
                            alt={content.title}
                        />

                    )}

                    {extension === "pdf" && (

                        <iframe
                            src={fileUrl}
                            title={content.title}
                        />

                    )}

                    {["mp4","mov","avi","mkv"].includes(extension) && (

                        <video controls>

                            <source
                                src={fileUrl}
                            />

                        </video>

                    )}

                </div>

            </div>

        </div>
    );

}