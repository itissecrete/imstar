exports.handler = async function(event, context) {
  // 1. CORS 설정: 기존 깃허브 페이지에서 서버로 접근할 수 있도록 허락해주는 문지기 역할
  const headers = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 브라우저의 사전 요청(Preflight) 무사 통과시키기
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    // 2. 깃허브 HTML 화면에서 유저가 보낸 질문(재료 등) 데이터 받기
    const body = JSON.parse(event.body);

    // 3. 넷리파이 환경 변수에 안전하게 숨겨둔 API 키 꺼내오기
    const API_KEY = process.env.GEMINI_API_KEY;

    // 4. 구글 제미나이에게 질문 보내기 (API 키 포함)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body) 
    });

    const data = await response.json();

    // 5. 제미나이가 준 레시피 답변을 다시 깃허브 HTML로 돌려주기
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "서버 에러가 발생했습니다." })
    };
  }
};
