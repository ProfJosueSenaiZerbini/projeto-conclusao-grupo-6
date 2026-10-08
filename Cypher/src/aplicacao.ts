import express from "express";
import path from "node:path";
import routes from "./app/routes/rotasCypher.js";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleUserRound,
  Clock3,
  Disc3,
  ExternalLink,
  FileMusic,
  Headphones,
  House,
  Lightbulb,
  ListChecks,
  MapPin,
  Menu,
  MicVocal,
  MoreHorizontal,
  Music,
  Music2,
  Plus,
  Radio,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-static";

const app = express();
const port = Number(process.env.PORT ?? 3000);

const icones = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  audioLines: AudioLines,
  badgeCheck: BadgeCheck,
  calendarCheck: CalendarCheck2,
  calendarDays: CalendarDays,
  chart: ChartNoAxesCombined,
  check: Check,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  circleCheck: CircleCheck,
  circleHelp: CircleHelp,
  circleUser: CircleUserRound,
  clock: Clock3,
  disc: Disc3,
  externalLink: ExternalLink,
  fileMusic: FileMusic,
  headphones: Headphones,
  house: House,
  lightbulb: Lightbulb,
  listChecks: ListChecks,
  mapPin: MapPin,
  menu: Menu,
  mic: MicVocal,
  more: MoreHorizontal,
  music: Music,
  music2: Music2,
  plus: Plus,
  radio: Radio,
  search: Search,
  settings: Settings,
  share: Share2,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
  tag: Tag,
  trophy: Trophy,
  user: UserRound,
  users: UsersRound,
  x: X,
};

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "views"));
app.locals.icones = icones;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), "public")));
app.use(routes);
app.use((_req, res) =>
  res.status(404).render("pages/nao-encontrado", {
    title: "Página não encontrada",
    path: "",
    stylesheet: "base",
    authenticated: false,
  })
);
app.listen(port, "0.0.0.0", () =>
  console.log(`Cypher MVC em http://localhost:${port}`)
);

export default app;
