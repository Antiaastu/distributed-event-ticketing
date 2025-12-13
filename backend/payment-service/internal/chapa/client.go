package chapa

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const (
	ChapaBaseURL = "https://api.chapa.co/v1"
)

type ChapaClient struct {
	SecretKey string
}

func NewChapaClient() *ChapaClient {
	return &ChapaClient{
		SecretKey: os.Getenv("CHAPA_SECRET_KEY"),
	}
}

type InitializeRequest struct {
	Amount      string `json:"amount"`
	Currency    string `json:"currency"`
	Email       string `json:"email"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	TxRef       string `json:"tx_ref"`
	CallbackURL string `json:"callback_url"`
	ReturnURL   string `json:"return_url"`
}

type InitializeResponse struct {
	Message interface{} `json:"message"`
	Status  string      `json:"status"`
	Data    struct {
		CheckoutURL string `json:"checkout_url"`
	} `json:"data"`
}

func (c *ChapaClient) InitializeTransaction(req *InitializeRequest) (*InitializeResponse, error) {
	url := fmt.Sprintf("%s/transaction/initialize", ChapaBaseURL)
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	r, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	r.Header.Set("Authorization", "Bearer "+c.SecretKey)
	r.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(r)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var chapaResp InitializeResponse
	if err := json.NewDecoder(resp.Body).Decode(&chapaResp); err != nil {
		return nil, err
	}

	if chapaResp.Status != "success" {
		return nil, fmt.Errorf("chapa initialization failed: %v", chapaResp.Message)
	}

	return &chapaResp, nil
}

type VerifyResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	Data    struct {
		Status string `json:"status"`
		TxRef  string `json:"tx_ref"`
	} `json:"data"`
}

func (c *ChapaClient) VerifyTransaction(txRef string) (*VerifyResponse, error) {
	url := fmt.Sprintf("%s/transaction/verify/%s", ChapaBaseURL, txRef)

	r, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	r.Header.Set("Authorization", "Bearer "+c.SecretKey)

	client := &http.Client{}
	resp, err := client.Do(r)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var chapaResp VerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&chapaResp); err != nil {
		return nil, err
	}

	return &chapaResp, nil
}
