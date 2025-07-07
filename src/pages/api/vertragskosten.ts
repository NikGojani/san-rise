import type { NextApiRequest, NextApiResponse } from 'next';

// Beispielhafte Vertragskosten
const posten = [
  { name: 'Firmenchat GPT', betrag: 20, intervall: 'monatlich' },
  { name: 'VEO3', betrag: 200, intervall: 'monatlich' },
  { name: 'Veranstalterhaftpflicht', betrag: 4000, intervall: 'jährlich' },
];

function calcMonatlich(p: {betrag: number, intervall: string}) {
  return p.intervall === 'monatlich' ? p.betrag : p.betrag / 12;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const summe = posten.reduce((sum, p) => sum + calcMonatlich(p), 0);
  res.status(200).json({ betrag: summe });
} 