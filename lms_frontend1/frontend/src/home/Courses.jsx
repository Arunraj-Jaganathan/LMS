import { useNavigate } from "react-router-dom";

function Courses(props) {
  const navigate = useNavigate();

  return (
    <div
      className="course-card"
      onClick={() => navigate(`/course/${props.id}`)}
      style={{ cursor: "pointer" }}
    >
      <img src={props.thumbnail} alt={props.name} />
      <h3>{props.name}</h3>
      <p>{props.description}</p>
      <div className="price-duration-div">
        <h3>₹{props.price}</h3>
        <h4>{props.duration}</h4>
      </div>
    </div>
  );
}

export default Courses;
