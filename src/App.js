import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import store from "./redux/store"

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--primary);
  width: 100px;
  cursor: pointer;
  :hover {
    background-color: var(--primary);
    color: var(--secondary);
  }
`;

export const StyledButtonFoot = styled.button`
  padding: 10px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--primary);
  width: 100px;
  cursor: pointer;
  :hover {
    background-color: var(--primary);
    color: var(--secondary);
  }
  @media (max-width: 766px) {
    margin-bottom: 24px;
    max-width: 120px;
    width: 120px;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (max-width: 766px) {
    flex-direction: column;
    flex-direction: column-reverse;
  }
`;

export const StyledLogo = styled.img`
  width: 300px;
  @media (min-width: 767px) {
    width: 300px;
  }
  max-height: 170px;
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  background-color: var(--accent);
  height: auto;
  width: 100vw;
  @media (min-width: 900px) {
    width: 45vw;
  }
  @media (min-width: 1000px) {
    width: 45vw;
  }
  transition: width 0.5s;
`;

export const StyledCont = styled.div`
  width: 90%;
  border: 2px solid var(--primary-text);
  padding: 24px;
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  align-items: center;
  @media (max-width: 766px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

export const BorderImg = styled.div`
  background-image: url('/config/images/separator.png');
  height:40px;
  width:100%;
  background-position-y: top;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = async () => {
    let totalWhiteListed;
    if (CONFIG.WHITE_LIST_MINT) {
      totalWhiteListed = await store
        .getState()
        .blockchain.smartContract.methods.whiteListMintCount(blockchain.account)
        .call();
    } else {
      totalWhiteListed = mintAmount;
    }
    if (totalWhiteListed <= 0) {
      setFeedback("Sorry, You are not in the whiteList wait untill the public sales beggin.");
    } else if (totalWhiteListed < mintAmount) {
      setFeedback(`Sorry, You ecceeded your mint amount${mintAmount}.`);
    } else {
      let cost = CONFIG.WEI_COST;
      let gasLimit = CONFIG.GAS_LIMIT;
      let totalCostWei = String(cost * mintAmount);
      let totalGasLimit = String(gasLimit * mintAmount);
      console.log("Cost: ", totalCostWei);
      console.log("Gas limit: ", totalGasLimit);
      setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
      setClaimingNft(true);
      blockchain.smartContract.methods
        .mint(blockchain.account)
        // .totalSupply()
        .send({
          gasLimit: String(totalGasLimit),
          to: CONFIG.CONTRACT_ADDRESS,
          from: blockchain.account,
          value: totalCostWei,
        })
        .once("error", (err) => {
          console.log(err);
          setFeedback("Sorry, something went wrong please try again later.");
          setClaimingNft(false);
        })
        .then((receipt) => {
          console.log(receipt);
          setFeedback(
            `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
          );
          setClaimingNft(false);
        });
      }
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: "0 0 24px 0", backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <ResponsiveWrapper flex={1} style={{ padding: "0 0 24px 0" }}>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              padding: 24,
              borderRadius: 24,
            }}
          >
            <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
            <s.SpacerSmall />
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {CONFIG.TITLE_TWO}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
                maxWidth: 400,
                marginTop:15,
                marginBottom:15,
              }}
            >
              BREAKING NEWS: Florida Man wrecks ethereum blockchain! Florida men are infamous for the craziest, whackiest news stories that shock the world! Come hang with us for a hurricane party! We have enough drinks for everyone!
            </s.TextDescription>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: "25",
                color: "var(--accent)",
              }}
            >
              {CONFIG.MAX_PER_WALLET}
            </s.TextTitle>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                        paddingTop: 25
                      }}
                    >
                      {CONFIG.SOLD_OUT}
                    </s.TextTitle>
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
        </ResponsiveWrapper>
        <BorderImg></BorderImg>
        <ResponsiveWrapper flex={1} style={{ padding: "24px 0" }}>
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              padding: 24,
              borderRadius: 24,
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Florida Man NFT:
            </s.TextTitle>
            <s.TextDescription
              style={{
                color: "var(--primary-text)",
                marginTop:15,
                marginBottom:15,
                lineHeight:2,
                maxWidth:700,
                fontSize:21,
              }}
            >
              - Only 5000 will ever be created!<br/>
              - Florida Man play2earn game coming in 2022.<br/>
              - Florida Man NFT holders will have early access to the game & token.<br/>
              - Florida Man NFT holders will have access to a private party hosted by the creator in Florida 2022.<br/>
              - Florida Man NFT holders will have access to exclusive merch and any future Florida Man activities/projects.<br/>
              - 5 NFTs per transaction<br/>
              - Florida Man NFT collection was created by a Florida native & does not intend to offend anyone. Just a funny tribute to Florida. Beers up!<br/>
            </s.TextDescription>
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/hidden1.png"} />
          </s.Container>
        </ResponsiveWrapper>
        <BorderImg></BorderImg>
        <ResponsiveWrapper flex={1} style={{ padding: "24px 0" }}>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/hidden2.png"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              padding: 24,
              borderRadius: 24,
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Florida Man Play2Earn Game - Coming 2022:
            </s.TextTitle>
            <s.TextDescription
              style={{
                color: "var(--primary-text)",
                marginTop:15,
                marginBottom:15,
                maxWidth: 700,
              }}
            >
              Florida men will go on missions during a hurricane. Go on beer runs, save tourists, put alligators back in their swamp, have hurricane parties, & so much more!
            </s.TextDescription>
            <s.SpacerMedium />
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Story Behind the NFT:
            </s.TextTitle>
            <s.TextDescription
              style={{
                color: "var(--primary-text)",
                marginTop:15,
                marginBottom:15,
                maxWidth: 700,
              }}
            >
              Most of the United States has a love/hate relationship with the state of Florida. Some of the craziest news stories have come from Florida. Some say the sun has fried our brains. Others say we just don’t give a damn. Hmm, well how bout that? Jokes from a bunch of people who save up every year just to come to the Sunshine State! Have fun making your jokes but I think we all know that NOTHING CAN STOP A FLORIDA MAN. We’re here to wreck the blockchain, baby! We will wreck NFT Twitter & become the most expensive NFT collection ever! We’re Florida Men, who would ever bet against us?
            </s.TextDescription>
            <s.SpacerMedium />
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Roadmap:
            </s.TextTitle>
            <s.TextDescription
              style={{
                color: "var(--primary-text)",
                marginTop:15,
                marginBottom:15,
                lineHeight:2,
                maxWidth:700,
                fontSize:21,
              }}
            >
              - 100% sold - 5 ETH giveaway in our discord.<br/>
              - January 2022 - Access to exclusive merch.<br/>
              - June 2022 - Party in Florida.<br/>
              - October 2022 - Florida Man game development.<br/>
            </s.TextDescription>
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        {CONFIG.SHOW_SOCIAL_SECTION ? (
          <StyledCont>
            {CONFIG.TWITTER != "" ? (
              <StyledButtonFoot
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CONFIG.TWITTER, "_blank");
                }}
              >
                TWITTER
              </StyledButtonFoot>
            ):null}
            {CONFIG.DISCORD != "" ? (
              <StyledButtonFoot
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CONFIG.DISCORD, "_blank");
                }}
              >
                DISCORD
              </StyledButtonFoot>
            ):null}
            {CONFIG.OPENSEA != "" ? (
              <StyledButtonFoot
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CONFIG.OPENSEA, "_blank");
                }}
              >
                OPENSEA
              </StyledButtonFoot>
            ):null}
            {CONFIG.SCAN_LINK != "" ? (
              <StyledButtonFoot
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CONFIG.SCAN_LINK, "_blank");
                }} 
                style={{
                  width: 170
                }}
              >
                VERIFY CONTRACT
              </StyledButtonFoot>
            ):null}
          </StyledCont>
        ):null}
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
