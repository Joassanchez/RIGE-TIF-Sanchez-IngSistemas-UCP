import { describe, expect, test } from "bun:test";
import { analizarComando } from "./comando";

describe("T2-09 L-1 L-2 L-3 lexer conservador", () => {
  const casos: [string, ReturnType<typeof analizarComando>["motivos"]][] = [
    ["ls -la", []], ["rm -rf x", []], ['echo "a|b"', []], ["echo 'a && b'", []],
    ['grep "x;y" f', []], ["echo '$(id)'", []], ["echo '`id`'", []],
    [String.raw`echo a\|b`, []], [String.raw`echo \&`, []], [String.raw`echo \(x\)`, []],
    [String.raw`echo \>`, []], [String.raw`echo "\$(id)"`, []],
    [String.raw`echo "a\"|b"`, []], ["echo ''", []], ["echo \"'\"", []],
    ["ls | grep a", ["tuberia"]], ["ls |& cat", ["tuberia"]],
    ["ls && rm -rf x", ["encadenamiento"]], ["ls || pwd", ["encadenamiento"]],
    ["ls; rm x", ["encadenamiento"]], ["sleep 1 &", ["segundo-plano"]],
    ["echo a > f", ["redireccion"]], ["echo a >> f", ["redireccion"]],
    ["cat < f", ["redireccion"]], ["ls 2> f", ["redireccion"]], ["ls &> f", ["redireccion"]],
    ["(cd x && ls)", ["subshell", "encadenamiento"]], ["echo )", ["subshell"]],
    ["echo $(whoami)", ["sustitucion"]], ["echo `id`", ["sustitucion"]],
    ['echo "$(id)"', ["sustitucion"]], ['echo "`id`"', ["sustitucion"]],
    ["cat <(ls)", ["sustitucion"]], ["cat >(ls)", ["sustitucion"]],
    ["ls\npwd", ["salto-de-linea"]], ["ls\r\npwd", ["salto-de-linea"]],
    ['echo "a\nb"', ["salto-de-linea"]], ["echo 'a\nb'", []],
    ['echo "sin cerrar', ["no-analizable"]], ["echo 'sin cerrar", ["no-analizable"]],
    ["ls \\", ["no-analizable"]], ['echo "x\\', ["no-analizable"]],
    ["echo $(id", ["sustitucion", "no-analizable"]],
    ['echo "$(echo "x|y")"', ["sustitucion"]],
    ["ls | cat && pwd | cat > f &\necho x", ["tuberia", "encadenamiento", "redireccion", "segundo-plano", "salto-de-linea"]],
    ["echo $(ls | cat)", ["sustitucion", "tuberia"]],
  ];
  for (const [comando, motivos] of casos) test(JSON.stringify(comando), () => {
    expect(analizarComando(comando)).toEqual({ comando: comando.trim(), motivos });
  });
});
