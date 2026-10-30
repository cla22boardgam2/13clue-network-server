/**
 * 공식 룰 카드 배분 검증: npm run verify
 * 모든 인원수 × 1000개 룸 코드에 대해 규칙 준수 여부를 확인합니다.
 */
import { CARDS, REMOVED_COLORS } from '../src/data/cards';
import { SECRET_SIZE, setupGame } from '../src/logic/setupGame';
import type { Card, Category } from '../src/types';

const count = (cards: Card[], c: Category) => cards.filter((x) => x.category === c).length;
let failures = 0;
const check = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++;
    console.error('  ✗', msg);
  }
};

for (let n = 2; n <= 6; n++) {
  const removed = REMOVED_COLORS[n];
  const activeCount = 30 - removed.length * 3;
  for (let r = 0; r < 1000; r++) {
    const code = `${n}${r.toString().padStart(3, '0')}`;
    const room = setupGame(code);
    const allUsed: Card[] = [...room.secretCards];

    check(room.players.length === n, `${code}: 인원 ${room.players.length}`);
    check(room.removedCards.length === removed.length * 3, `${code}: 제외 ${room.removedCards.length}`);
    check(room.removedCards.every((c) => removed.includes(c.color)), `${code}: 제외 색깔 불일치`);

    for (const p of room.players) {
      allUsed.push(...p.outerCards, ...p.innerCards);

      // 바깥 카드 3장: 인물1 장소1 흉기1
      check(p.outerCards.length === 3, `${code}: 바깥 ${p.outerCards.length}장`);
      check(
        count(p.outerCards, 'PERSON') === 1 &&
          count(p.outerCards, 'LOCATION') === 1 &&
          count(p.outerCards, 'WEAPON') === 1,
        `${code}: 바깥 카테고리`,
      );

      // 안쪽 카드 2장
      check(p.innerCards.length === 2, `${code}: 안쪽 ${p.innerCards.length}장`);

      // 넘긴 카드 3장: 인물1 장소1 흉기1
      check(p.givenCards.length === 3, `${code}: 넘긴 ${p.givenCards.length}장`);
      check(
        count(p.givenCards, 'PERSON') === 1 &&
          count(p.givenCards, 'LOCATION') === 1 &&
          count(p.givenCards, 'WEAPON') === 1,
        `${code}: 넘긴 카테고리`,
      );

      // 제외 색깔 카드가 포함되지 않아야 함
      check(
        [...p.outerCards, ...p.innerCards].every((c) => !removed.includes(c.color)),
        `${code}: 제외 카드 혼입`,
      );

      check(p.tokens === 1, `${code}: 토큰 1`);
    }

    // 왼쪽 이웃 검증: player i의 givenCards = player (i-1+n)%n 의 outerCards
    for (let i = 0; i < n; i++) {
      const left = (i - 1 + n) % n;
      const given = room.players[i].givenCards.map((c) => c.id).sort();
      const leftOuter = room.players[left].outerCards.map((c) => c.id).sort();
      check(JSON.stringify(given) === JSON.stringify(leftOuter), `${code}: 왼쪽이웃 검증 seat ${i}`);
    }

    check(room.secretCards.length === SECRET_SIZE[n], `${code}: 비밀 ${room.secretCards.length}`);
    check(allUsed.length === activeCount, `${code}: 총 ${allUsed.length} (기대 ${activeCount})`);
    check(new Set(allUsed.map((c) => c.id)).size === activeCount, `${code}: 중복 카드`);

    // 결정성
    const again = setupGame(code);
    check(JSON.stringify(again) === JSON.stringify(room), `${code}: 결정성`);
  }
  console.log(`${n}인: 1000개 룸 코드 검사 완료 (사용 ${activeCount}장, 비밀 ${SECRET_SIZE[n]}장, 제외 ${removed.join('·') || '없음'})`);
}

check(CARDS.length === 30, '카드 30장');
console.log(failures === 0 ? '\n✅ 모든 검증 통과' : `\n❌ 실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
