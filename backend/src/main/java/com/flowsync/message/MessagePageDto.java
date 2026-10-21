package com.flowsync.message;

import java.util.ArrayList;
import java.util.List;

/**
 * A page of conversation history. Page 0 contains the newest messages; older pages
 * step backwards through the conversation. Items are always chronological.
 */
public class MessagePageDto {

    private List<MessageDto> items = new ArrayList<>();
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNewer;
    private boolean hasOlder;

    public MessagePageDto() {
    }

    public MessagePageDto(
            List<MessageDto> items,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean hasNewer,
            boolean hasOlder
    ) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNewer = hasNewer;
        this.hasOlder = hasOlder;
    }

    public List<MessageDto> getItems() {
        return items;
    }

    public void setItems(List<MessageDto> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isHasNewer() {
        return hasNewer;
    }

    public void setHasNewer(boolean hasNewer) {
        this.hasNewer = hasNewer;
    }

    public boolean isHasOlder() {
        return hasOlder;
    }

    public void setHasOlder(boolean hasOlder) {
        this.hasOlder = hasOlder;
    }
}
