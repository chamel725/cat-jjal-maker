import logo from './logo.svg';
import React,{useState, useEffect} from 'react';
import './App.css';
//./:동일폴더
import Title from './components/Title'

 //LocalStorage에 무조건적으로 string값으러 저장되는 문제 해결
 const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
};

//text를 인자로 받아서 대사를 넘기면 대사에 맞는 고양이 이미지를 반환
const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(
    `${OPEN_API_DOMAIN}/cat/says/${text}?json=true`
  );
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

function CatItem(props) {
  console.log(props);
  return (
    <li>
      <img
        src={props.img}
        //object추가 할 때 중괄호 한 번 더
        //내가 원하는 태그에 style이라는 tag를 넘기고 거기에 object로 key랑 value값 넘겨주기
        //value값은 string으로 처리
        style={{ width: "150px" }}
      />
    </li>
  );
}
//component는 무조건 대문자
function Favorites({ favorites }) {
  //고양이 데이터 없으면 메세지 띄우기
  //조건부 렌더링
  if (favorites.length === 0) {
    return <div>사진 위 하트를 눌러 고양이 사진을 저장해봐요</div>;
  }
  return (
    <ul className="favorites">
      {favorites.map((cat) => (
        <CatItem img={cat} key={cat} />
      ))}
    </ul>
  );
}
//하트 눌렀을 때 이벤트를 이 안에서 처리하는게 아니고
//함수를 상위에 올린 다음, 그걸 이 MainCard에서 받아서 처리해보자.
const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  const heartIcon = alreadyFavorite ? "💖" : "🤍";

  function handleHeartMouseOver() {
    console.log("하트 스쳐 지나감");
  }
  return (
    <div className="main-card">
      <img src={img} alt="고양이" width="400" />
      <button
        onClick={onHeartClick} //onClick의 경우 handle~Click
        //onMouseOver={handleHeartMouseOver} onMouseOver의 경우 handle~MouseOver라고 짓는게 관례
      >
        {heartIcon}
      </button>
    </div>
  );
};



//props로 함수자체를 넘겨줄 수 있다.
const Form = ({ updateMainCat }) => {
  const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  //input에 값을 입력할 떄 마다 값이 잘 들어오는 지 찍어보자.
  function handleInputChange(e) {
    const userValue = e.target.value;
    setErrorMessage("");
    //userValue에 한글이 포함되어 있는지 검사
    console.log(includesHangul(userValue));
    //includesHangul가 true면 errormessage출력
    if (includesHangul(userValue)) {
      setErrorMessage("한글은 입력할 수 없습니다.");
    }
    setValue(userValue.toUpperCase());
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    //else쓸 거 없이 setErrorMessage를 빈 값으로 초기화 해두자.
    setErrorMessage("");
    if (value === "") {
      setErrorMessage("빈 값으로 만들 수 없습니다.");
      return; //함수가 updateMainCat까지 가지 않고 끝날 수 있게
    }
    updateMainCat(value);
  }

  //console.log(e.target.value.toUpperCase());

  //form의 submit에 첫 번째 인자로 event가 들어오고
  //그 이벤트에 preventDefault를 했을 때 이벤트의 기본 동작이 막아진다.
  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        placeholder="영어 대사를 입력해주세요"
        value={value}
        onChange={handleInputChange} //input에 값이 체인지 떄 마다 이 함수가 불려라(내장API)
      />
      <button type="submit">생성</button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </form>
  );
};
//counter상태를 부모 component에 옮겨보자
const App = () => {
  const CAT1 =
    "https://cataas.com/cat/60b73094e04e18001194a309/says/react";
  const CAT2 =
    "https://cataas.com//cat/5e9970351b7a400011744233/says/inflearn";
  const CAT3 =
    "https://cataas.com/cat/595f280b557291a9750ebf65/says/JavaScript";
  //localstorage는 무조건 string값으로 저장되므로 number값으로 전환
  const [counter, setCounter] = useState(() => {
    return jsonLocalStorage.getItem("counter");
  });
  const [mainCat, setMainCat] = useState(CAT1);
  //null값이면 빈 배열로 초기화
  // ||:앞에께 없으면 뒤에껄 써라.
  const [favorites, setFavorites] = useState(() => {
    return jsonLocalStorage.getItem("favorites") || [];
  });
  //includes:배열안의 값이 있는지 true false로 확인해서 반환
  const alreadyFavorite = favorites.includes(mainCat);
  //app진입시 api데이터를 콜해서 maincat으로 갈아주기.
  async function setInitialCat() {
    const newCat = await fetchCat("First cat");
    setMainCat(newCat);
  }

  //내가 원하는 시점만 함수를 호출하고 싶을 때 사용
  //기본적으로 ui가 새로 업데이트 될 떄마다 계속 불린다.
  //내가 원하는 상태를 두번째 인자 배열에 넣어서 그 상태가 바뀔 떄만 호출하게 하자.
  //맨 처음 app이 호출됐을때만 한 번 부르고 싶을 때는 빈 배열
  useEffect(() => {
    setInitialCat();
  }, []);

  useEffect(() => {
    console.log("hello");
  }, [counter]);

  //await문법 확인
  async function updateMainCat(value) {
    //input에 입력한 value값을 가져오자
    const newCat = await fetchCat(value);
    //event.preventDefault();
    console.log("폼 전송됨");
    setMainCat(newCat); //API콜해서 받은 응답값을 넣어보자

    setCounter((prev) => {
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter);
      return nextCounter;
    });
  }

  //handleHeartClick했을 때 localstorage.setItem으로 favorites저장하면된다.
  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat];
    console.log("하트 눌렀음");
    //ES6 + 스프레드 오퍼레이터 문법
    //현재 있는 기존 배열 CAT1,CAT2를 펼쳐쓴뒤 CAT3를 쓴것.
    setFavorites(nextFavorites); //setFavorites([CAT1,CAT2,CAT3])
    jsonLocalStorage.setItem("favorites", nextFavorites);
  }
  //counter가 null이면 counter보여주지 않기
  const counterTitle = counter === null ? "" : counter + "번째 ";

  //Form component(자식 컴포넌트)안에서만 쓰이던 상태를 상위 컴포넌트에서 같이 쓰고 싶을 때
  //그 상태를 위로 끌어롤리게 된다. -> 상태끌어올리기(lifting state up)
  //상태를 다른 컴포넌트에서 선언하도록 바꾸고 위에서 만든 상태를 자식컴포넌트로의 props로 넘겨준다.
  return (
    <div>
      <Title>{counterTitle} 고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard
        img={mainCat}
        onHeartClick={handleHeartClick}
        alreadyFavorite={alreadyFavorite}
      />
      <Favorites favorites={favorites} />
    </div>
  );
};

export default App;
