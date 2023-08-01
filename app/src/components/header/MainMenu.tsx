import { useAtom } from "jotai";

import { Menu } from "@/components/common/Menu";
import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { dataOnLoadAtom, dataRepresentationAtom, devicesAtom, languageAtom } from "@/lib/settings";

export function MainMenu() {
  const [devices, setDevices] = useAtom(devicesAtom);
  const [dataRepresentation, setDataRepresentation] = useAtom(dataRepresentationAtom);
  const [dataOnLoad, setDataOnLoad] = useAtom(dataOnLoadAtom);
  const [language, setLanguage] = useAtom(languageAtom);

  const translate = useTranslate();

  const [status] = useSimulator();
  const stopped = status.type === "stopped";

  return (
    <Menu strategy="fixed" placement="bottom-end" shift={8} offset={8}>
      <Menu.Button
        className="flex h-full items-center p-3 outline-none transition hover:bg-slate-500/30 focus:bg-slate-500/30 focus:outline-none"
        title={translate("menu.label")}
      >
        <span className="icon-[carbon--menu] h-6 w-6" />
      </Menu.Button>

      <Menu.Content>
        <Menu.Title>{translate("menu.label")}</Menu.Title>

        <Menu.Separator />

        <Menu.Radio<typeof devices>
          leading="icon-[carbon--devices]"
          value={devices}
          onChange={setDevices}
          options={["pio-switches-and-leds", "pio-printer", "handshake"]}
          getOptionLabel={option => translate(`menu.devices.${option}`)}
          disabled={!stopped}
        >
          {translate("menu.devices.label")}
        </Menu.Radio>

        <Menu.Radio<typeof dataRepresentation>
          leading="icon-[carbon--character-whole-number]"
          value={dataRepresentation}
          onChange={setDataRepresentation}
          options={["hex", "bin", "uint", "int", "ascii"]}
          getOptionLabel={option => translate(`menu.dataRepresentation.${option}`)}
        >
          {translate("menu.dataRepresentation.label")}
        </Menu.Radio>

        <Menu.Radio<typeof dataOnLoad>
          leading="icon-[carbon--data-table]"
          value={dataOnLoad}
          onChange={setDataOnLoad}
          options={["unchanged", "clean", "randomize"]}
          getOptionLabel={option => translate(`menu.dataOnLoad.${option}`)}
        >
          {translate("menu.dataOnLoad.label")}
        </Menu.Radio>

        <Menu.Separator />

        <Menu.Radio<typeof language>
          leading="icon-[carbon--translate]"
          value={language}
          onChange={setLanguage}
          options={["en", "es"]}
          getOptionLabel={lang => (
            <span className="flex items-center gap-1 [&_svg]:h-5">
              {lang === "en" && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                    <path
                      fill="#00247D"
                      d="M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z"
                    />
                    <path
                      fill="#CF1B2B"
                      d="M25.14 23l9.712 6.801c.471-.479.808-1.082.99-1.749L28.627 23H25.14zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943V23zm10-10h2.141l9.711-6.8c-.521-.53-1.188-.909-1.937-1.085L23 12.057V13zm-12.141 0L1.148 6.2C.677 6.68.34 7.282.157 7.949L7.372 13h3.487z"
                    />
                    <path
                      fill="#EEE"
                      d="M36 21H21v10h2v-5.836L31.335 31H32c1.117 0 2.126-.461 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36v-2zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21H0zM36 9c0-1.091-.439-2.078-1.148-2.8L25.141 13H23v-.943l9.915-6.942C32.62 5.046 32.316 5 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059V9zM13 5v5.837L4.664 5H4c-1.118 0-2.126.461-2.852 1.2l9.711 6.8H7.372L.157 7.949C.065 8.286 0 8.634 0 9v.059L5.628 13H0v2h15V5h-2z"
                    />
                    <path fill="#CF1B2B" d="M21 15V5h-6v10H0v6h15v10h6V21h15v-6z" />
                  </svg>
                  English
                </>
              )}

              {lang === "es" && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                    <path
                      fill="#75AADB"
                      d="M36 27c0 2.209-1.791 4-4 4H4c-2.209 0-4-1.791-4-4V9c0-2.209 1.791-4 4-4h28c2.209 0 4 1.791 4 4v18z"
                    />
                    <path fill="#EEE" d="M0 13h36v10H0z" />
                    <path
                      fill="#FCBF49"
                      d="M18 13l.488 2.548 1.426-2.167-.525 2.54 2.146-1.457-1.457 2.147 2.541-.524-2.167 1.425L23 18l-2.548.488 2.167 1.426-2.541-.525 1.457 2.146-2.146-1.457.525 2.541-1.426-2.167L18 23l-.488-2.548-1.425 2.167.524-2.541-2.147 1.457 1.457-2.146-2.54.525 2.167-1.426L13 18l2.548-.488-2.167-1.425 2.54.524-1.457-2.147 2.147 1.457-.524-2.54 1.425 2.167z"
                    />
                    <path
                      fill="#843511"
                      d="M18 14.33l.242 1.265.116.605.339-.514.708-1.076-.261 1.261-.125.604.51-.346 1.066-.723-.723 1.066-.346.51.603-.125 1.262-.26-1.076.708-.515.337.605.116L21.67 18l-1.265.242-.605.116.514.339 1.076.708-1.262-.261-.604-.125.346.51.723 1.065-1.065-.723-.51-.346.125.604.261 1.262-.708-1.076-.338-.515-.116.605L18 21.67l-.242-1.265-.116-.605-.339.515-.708 1.076.26-1.262.125-.603-.51.346-1.066.723.723-1.066.346-.51-.604.125-1.261.261 1.076-.708.514-.339-.605-.116L14.33 18l1.265-.242.605-.116-.515-.339-1.076-.708 1.261.26.603.125-.346-.51-.724-1.066 1.066.724.51.346-.125-.603-.26-1.261.708 1.076.339.515.116-.605L18 14.33M18 13l-.488 2.548-1.425-2.167.524 2.541-2.147-1.457 1.457 2.147-2.54-.524 2.167 1.425L13 18l2.548.488-2.167 1.426 2.54-.525-1.457 2.146 2.147-1.457-.524 2.541 1.425-2.167L18 23l.488-2.548 1.426 2.167-.525-2.541 2.146 1.457-1.457-2.146 2.541.525-2.167-1.426L23 18l-2.548-.488 2.167-1.425-2.541.524 1.457-2.147-2.146 1.457.525-2.541-1.426 2.167L18 13zm1.914.381h.005-.005zm1.621 1.083h.005-.005zm1.084 1.623h.005-.005z"
                    />
                    <circle fill="#FCBF49" cx="18" cy="18" r="2" />
                    <path
                      fill="#843511"
                      d="M18 20.125c-1.172 0-2.125-.953-2.125-2.125s.953-2.125 2.125-2.125 2.125.953 2.125 2.125-.953 2.125-2.125 2.125zm0-4c-1.034 0-1.875.841-1.875 1.875s.841 1.875 1.875 1.875 1.875-.841 1.875-1.875-.841-1.875-1.875-1.875z"
                    />
                    <path
                      fill="#C16540"
                      d="M17.801 17.774c0 .155-.261.28-.583.28-.323 0-.584-.125-.584-.28 0-.155.261-.28.584-.28.322 0 .583.125.583.28zm1.553-.024c0-.161-.266-.292-.594-.292-.328 0-.594.13-.594.292s.266.292.594.292c.329 0 .594-.131.594-.292z"
                    />
                    <path
                      fill="#ED8662"
                      d="M17.463 18.874c0-.126.246-.229.548-.229.303 0 .548.102.548.229 0 .126-.246.229-.548.229-.303 0-.548-.103-.548-.229z"
                    />
                  </svg>
                  Español
                </>
              )}
            </span>
          )}
        >
          {translate("menu.language")}
        </Menu.Radio>

        <Menu.Separator />

        <Menu.Item href="docs" external leading="icon-[carbon--document]">
          {translate("menu.documentation")}
        </Menu.Item>
        <Menu.Item
          href="https://github.com/vonsim/vonsim"
          external
          leading="icon-[carbon--logo-github]"
        >
          GitHub
        </Menu.Item>
        <Menu.Item
          href="https://github.com/vonsim/vonsim/issues/new?labels=new+version"
          external
          leading="icon-[carbon--warning-filled]"
        >
          {translate("menu.report-issue")}
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
