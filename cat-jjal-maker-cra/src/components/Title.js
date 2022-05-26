const Title = (props) => {
    console.log(props);
    //태그 안에 적은 내용은 children이라는 이름으로 넘어온다.
    return <h1>{props.children}</h1>;
  };

  export default Title;