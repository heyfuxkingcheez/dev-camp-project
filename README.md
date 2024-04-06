Devcamp - second week project

## 목적

- 예시코드를 보며 결제 관련 비즈니스 로직을 습득
- 직접 PG사 연결
- 정액제, 정률제 쿠폰 적용
- 토큰 블랙리스트 방식 적용

## 구현 기능

- 로그인
- 회원가입
- 로그아웃
- JWT 토큰 인증, 인가
- JWT 토큰 블랙리스트 추가
- PG사 결제 연동
- 쿠폰 적용가 결제

## 구상 로직

- 회원가입시 30% 할인 쿠폰과 5000원 할인 쿠폰을 지급
- 특정 물건 구입시 원하는 쿠폰을 선택
- 해당 쿠폰에 따라 가격을 조정 후 결제
- Admin은 물건을 사고 팔 수 있다.

## 최초 로그인

- 로그인 요청
- access token, refresh token 생성 및 반환, refresh token redis에 저장
- access token 세션 스토리지, refresh token 쿠키에 저장

## 클라이언트 요청시

- access token 유효기간 확인
- 유효 토큰: header에 담아 요청보냄
- 유효하지 않은 토큰: refresh token header에 담아 acces token 재발급 요청한다.(refresh - 유효하면 access token 재발급, 재저장 후 요청 다시 보내기)

## #로그아웃

- 로그아웃 요청
- 세션에 있는 access token 삭제
- redis 저장된 refresh 삭제, 해당 access token을 redis black list에 추가(이때 access - token의 남은 유효 기간만큼 설정하여 저장해준다.)
- 사용자가 서비스 사용을 끝냈지만, 아직 유효기간이 끝나지않은 토큰을 Redis의 블랙리스트에 - - 저장하고, 모든 클라이언트 요청이 들어올 때 Redis의 블랙리스트를 조회한다.
- 블랙리스트에 존재하는 토큰으로 인증 시도시 거부

## Coupon 구상 로직

- 회원가입시 해당 유저에게 30% 할인 쿠폰과 5000원 할인 쿠폰 지급

## 구상 DB

- 회원

id, userName, password, phone, role(Admin | user), couponId(FK)

## 상품

id, productName, price, isSoldOut, userId(FK), createdAt, updatedAt

## 쿠폰

id, couponName, applyPrice, applyPercentage, expiredAt, couponType(price | percent), userId(PK)

## 결제

id, total_price, userId(FK), productId(FK), createdAt, isAccept

## 기술 스택

Typescript, Nest.js, PostgreSQL, TypeORM
